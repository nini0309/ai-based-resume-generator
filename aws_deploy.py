import boto3
import json
import os
from botocore.exceptions import ClientError
import mimetypes
import time
import zipfile

# ---------- CONFIG ----------
AWS_ACCESS_KEY = ""
AWS_SECRET_KEY = ""
REGION = "us-east-1"
BUCKET_NAME = "resume-generator-nishtha"
FRONTEND_FOLDER = "./frontend/dist"
BACKEND_FOLDER = "./backend"
ZIP_FILE = "backend.zip"
ZIP_S3_KEY = "flask-backend/backend.zip"
AMI_ID = "ami-07860a2d7eb515d9a"  # Amazon Linux 2023
INSTANCE_TYPE = "t3.micro"
SECURITY_GROUP_NAME = "flask-app-sg"

# ---------- STEP 1: ZIP BACKEND ----------
def zip_backend_folder(folder_path, zip_file):
    with zipfile.ZipFile(zip_file, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, folder_path)
                zipf.write(file_path, arcname)
    print(f"✅ Created {zip_file}")

zip_backend_folder(BACKEND_FOLDER, ZIP_FILE)

# ---------- CREATE CLIENTS ----------
s3 = boto3.client(
    "s3",
    region_name=REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
)
ec2 = boto3.client("ec2", region_name=REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
)

# ---------- 2. CREATE BUCKET ----------
try:
    if REGION == "us-east-1":
        s3.create_bucket(Bucket=BUCKET_NAME)
    else:
        s3.create_bucket(
            Bucket=BUCKET_NAME,
            CreateBucketConfiguration={"LocationConstraint": REGION},
        )
    print(f"✅ Bucket '{BUCKET_NAME}' created.")
except ClientError as e:
    print(f"⚠️ Bucket create: {e}")

# ---------- 3. UPLOAD FRONTEND & BACKEND ----------
print("\n📦 Uploading backend.zip to S3...")
s3.upload_file(ZIP_FILE, BUCKET_NAME, ZIP_S3_KEY)
print(f"✅ Uploaded backend to s3://{BUCKET_NAME}/{ZIP_S3_KEY}")

for root, _, files in os.walk(FRONTEND_FOLDER):
    for filename in files:
        local_path = os.path.join(root, filename)
        relative_path = os.path.relpath(local_path, FRONTEND_FOLDER)
        s3_path = relative_path.replace("\\", "/")
        content_type, _ = mimetypes.guess_type(local_path)
        if content_type is None:
            content_type = "binary/octet-stream"

        try:
            s3.upload_file(
                local_path,
                BUCKET_NAME,
                s3_path,
                ExtraArgs={"ContentType": content_type},
            )
            print(f"✅ Uploaded {s3_path} as {content_type}")
        except Exception as e:
            print(f"⚠️ Upload failed for {s3_path}: {e}")

# ---------- 4. ENABLE WEBSITE HOSTING ----------
website_config = {
    "ErrorDocument": {"Key": "index.html"},
    "IndexDocument": {"Suffix": "index.html"},
}

try:
    s3.put_bucket_website(Bucket=BUCKET_NAME, WebsiteConfiguration=website_config)
    print("✅ Static website hosting enabled.")
except ClientError as e:
    print(f"⚠️ Website hosting: {e}")

# ---------- 5. REMOVE BLOCK PUBLIC ACCESS ----------
try:
    s3.delete_public_access_block(Bucket=BUCKET_NAME)
    print("✅ Removed block public access.")
except ClientError as e:
    print(f"⚠️ Public access block: {e}")

# ---------- 6. SET PUBLIC POLICY ----------
bucket_policy = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": [f"arn:aws:s3:::{BUCKET_NAME}/*"],
        }
    ],
}

try:
    s3.put_bucket_policy(Bucket=BUCKET_NAME, Policy=json.dumps(bucket_policy))
    print("✅ Public-read policy applied.")
except ClientError as e:
    print(f"⚠️ Bucket policy: {e}")

print(f"\n🌍 Website available at: http://{BUCKET_NAME}.s3-website-{REGION}.amazonaws.com")

# ---------- 7. CREATE SECURITY GROUP ----------
try:
    vpc_id = ec2.describe_vpcs()["Vpcs"][0]["VpcId"]
    sg = ec2.create_security_group(
        GroupName=SECURITY_GROUP_NAME,
        Description="Allow Flask traffic",
        VpcId=vpc_id,
    )
    sg_id = sg["GroupId"]
    ec2.authorize_security_group_ingress(
        GroupId=sg_id,
        IpPermissions=[
            {
                "IpProtocol": "tcp",
                "FromPort": 5000,
                "ToPort": 5000,
                "IpRanges": [{"CidrIp": "0.0.0.0/0"}],
            },
            {
                "IpProtocol": "ssh",
                "FromPort": 22,
                "ToPort": 22,
                "IpRanges": [{"CidrIp": "0.0.0.0/0"}],
            }
        ],
    )
    print(f"✅ Created security group {sg_id}")
except ClientError as e:
    if "InvalidGroup.Duplicate" in str(e):
        sg_id = ec2.describe_security_groups(GroupNames=[SECURITY_GROUP_NAME])[
            "SecurityGroups"
        ][0]["GroupId"]
        print(f"ℹ️ Using existing security group {sg_id}")
    else:
        raise e

# ---------- 8. USER DATA SCRIPT ----------
# Since bucket is already public, no IAM role is needed.
USER_DATA = f"""#!/bin/bash

# Update system and install Python, pip, and unzip
dnf update -y
dnf install -y python3 unzip curl
dnf install -y python3-pip

# Install Flask
pip3 install flask flask-cors

# Move to ec2-user's home
cd /home/ec2-user

# Download backend zip from S3
curl -O https://{BUCKET_NAME}.s3.amazonaws.com/{ZIP_S3_KEY}

# Unzip backend
unzip -o backend.zip -d backend
cd backend

# Install dependencies if present
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt
fi

# Run Flask app
nohup python3 app.py > /home/ec2-user/flask.log 2>&1 &
"""

# ---------- 9. LAUNCH EC2 ----------
print("\n🚀 Launching EC2 instance...")

instance = ec2.run_instances(
    ImageId=AMI_ID,
    InstanceType=INSTANCE_TYPE,
    MinCount=1,
    MaxCount=1,
    SecurityGroupIds=[sg_id],
    UserData=USER_DATA,
    TagSpecifications=[
        {"ResourceType": "instance", "Tags": [{"Key": "Name", "Value": "FlaskBackend"}]}
    ],
)

instance_id = instance["Instances"][0]["InstanceId"]
print(f"⏳ Waiting for instance {instance_id} to start...")

ec2_resource = boto3.resource(
    "ec2", region_name=REGION,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY
)
instance_obj = ec2_resource.Instance(instance_id)
instance_obj.wait_until_running()
instance_obj.reload()

public_ip = instance_obj.public_ip_address
print(f"\n🌍 Flask API should be available soon at: http://{public_ip}:5000")

config_data = {
    "API_BASE_URL": f"http://{public_ip}:5000"
}

with open("config.json", "w") as f:
    json.dump(config_data, f, indent=2)

print("✅ Created local config.json")

# ---------- 3. UPLOAD TO S3 ----------
s3.upload_file("config.json", BUCKET_NAME, "config.json", ExtraArgs={"ContentType": "application/json"})

print(f"✅ Uploaded config.json to s3://{BUCKET_NAME}/config.json")