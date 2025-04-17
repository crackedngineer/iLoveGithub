import os
import requests
import json
from datetime import datetime, timedelta

# GitHub API settings
GITHUB_API_URL = "https://api.github.com/search/repositories"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
OUTPUT_FILE = "data/trending_repositories.json"


def fetch_trending_repositories(language: str = "", per_page: int = 10):
    # Calculate date for one week ago
    one_week_ago = datetime.now() - timedelta(weeks=1)
    formatted_date = one_week_ago.strftime("%Y-%m-%d")

    # Build query for the search
    query = f"created:>{formatted_date}"
    if language:
        query += f" language:{language}"

    # Build the GitHub API request URL
    url = f"{GITHUB_API_URL}?q={query}&sort=stars&order=desc&per_page={per_page}"

    # Set headers for GitHub API request
    headers = {
        "Accept": "application/vnd.github+json",
    }

    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    try:
        # Make the request to the GitHub API
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            raise Exception(
                f"Failed to fetch trending repositories, status code: {response.status_code}"
            )

        # Process the response data
        data = response.json()
        items = [
            {
                "id": repo["id"],
                "name": repo["name"],
                "full_name": repo["full_name"],
                "html_url": repo["html_url"],
                "description": repo["description"],
                "stargazers_count": repo["stargazers_count"],
                "language": repo["language"],
                "owner": {
                    "login": repo["owner"]["login"],
                    "avatar_url": repo["owner"]["avatar_url"],
                    "html_url": repo["owner"]["html_url"],
                },
            }
            for repo in data["items"]
        ]

        return items

    except requests.exceptions.RequestException as error:
        print(f"Error fetching data from GitHub API: {error}")
        return None


def save_trending_repositories_to_json(repositories: list):
    # Save the data to a JSON file
    with open(OUTPUT_FILE, "w") as f:
        json.dump(repositories, f, indent=4)
    print(f"Trending repositories saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    # Fetch the trending repositories (adjust language and per_page as needed)
    trending_repositories = fetch_trending_repositories(language="python", per_page=6)

    if trending_repositories:
        # Save the repositories to the JSON file
        save_trending_repositories_to_json(trending_repositories)
