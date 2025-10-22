import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Access the OpenAI API key
API_KEY = os.getenv("API_KEY")

genai.configure(api_key=API_KEY)

def llm_response(userdescription):
    prompt = "Generate a professional IT job resume in JSON format based on the following description. Ensure the JSON is consistent, well-structured, and contains all specified keys, even if some values are empty or null. Use the exact keys provided below and maintain their hierarchy."
    prompt += "Input Description: " + userdescription
    prompt += """
    JSON Structure Requirements:
    personalInformation: Include the following keys:
    fullName (string)
    email (string)
    phoneNumber (string)
    location (string)
    linkedIn (string or null if not provided)
    gitHub (string or null if not provided)
    portfolio (string or null if not provided)
    summary: A brief overview of skills, experience, and career goals (string).
    skills: List of object that contain two keys 'title' and 'level'

    experience: A list of job roles. Each job role should include:
    jobTitle (string)
    company (string)
    location (string)
    duration (string, e.g., "Jan 2020 - Present")
    responsibility(string)

    education: A list of degrees. Each degree should include:
    degree (string)
    university (string)
    location (string)
    graduationYear (string)

    certifications: A list of certifications. Each certification should include:
    title (string)
    issuingOrganization (string)
    year (string)

    projects: A list of key projects. Each project should include:
    title (string)
    description (string)
    technologiesUsed (array of strings)
    githubLink (string or null if not provided)

    achievements: A list achievements that contains objects of keys
    title (string)
    year(string)
    extraInformation(string)

    languages: A list of spoken languages objects contain keys
    id(number)
    name(string)

    interests: A list of additional interests or hobbies related to technology or professional development  [list of objects having keys].
    id(number)
    name(string)
    """
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)

    return response.text.strip()

def parse_response(response):
    json_start = response.find("```json") + 7
    json_end = response.rfind("```")
    return response[json_start:json_end].strip()