"""
pip install -qU \
    langchain \
    requests \
    pydantic \
    pydantic_settings \
    rich \
    tweepy \
    langchain-openai \
    toon-python

Add the secrets in environment variables or in a .env file.

--> Fetching Linkediin RefreshToken after expiry
Goto https://www.linkedin.com/developers/tools/oauth?clientId=8657g0g8iblf08 in different browser where linkedin profile is not logged in.
"""

import os
import sys
import json
import tweepy
import argparse
import requests
from enum import Enum
from typing import List, Dict, Type
from datetime import datetime
from abc import ABC, abstractmethod

from rich.console import Console
from tweepy.client import Response
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from toon_format import encode as toon_encode

console = Console()
rprint = console.print

# ---------------------------------------------
# Constants
# ---------------------------------------------
LIVE_URL = "https://ilovegithub.oderna.in"
GITHUB_REPO = "crackedngineer/iLoveGithub"
LINKEDIN_API_URL = "https://api.linkedin.com/v2/ugcPosts"
MAX_XCOM_CHARS = 280
MAX_LINKEDIN_CHARS = 1300
BOLD_CHARS = {
    "a": "𝗮",
    "b": "𝗯",
    "c": "𝗰",
    "d": "𝗱",
    "e": "𝗲",
    "f": "𝗳",
    "g": "𝗴",
    "h": "𝗵",
    "i": "𝗶",
    "j": "𝗷",
    "k": "𝗸",
    "l": "𝗹",
    "m": "𝗺",
    "n": "𝗻",
    "o": "𝗼",
    "p": "𝗽",
    "q": "𝗾",
    "r": "𝗿",
    "s": "𝘀",
    "t": "𝘁",
    "u": "𝘂",
    "v": "𝘃",
    "w": "𝘄",
    "x": "𝘅",
    "y": "𝘆",
    "z": "𝘇",
    "A": "𝗔",
    "B": "𝗕",
    "C": "𝗖",
    "D": "𝗗",
    "E": "𝗘",
    "F": "𝗙",
    "G": "𝗚",
    "H": "𝗛",
    "I": "𝗜",
    "J": "𝗝",
    "K": "𝗞",
    "L": "𝗟",
    "M": "𝗠",
    "N": "𝗡",
    "O": "𝗢",
    "P": "𝗣",
    "Q": "𝗤",
    "R": "𝗥",
    "S": "𝗦",
    "T": "𝗧",
    "U": "𝗨",
    "V": "𝗩",
    "W": "𝗪",
    "X": "𝗫",
    "Y": "𝗬",
    "Z": "𝗭",
}


# ---------------------------------------------
# Enums
# ---------------------------------------------
class PlatformEnum(str, Enum):
    XCOM = "xcom"
    LINKEDIN = "linkedin"
    REDDIT = "reddit"


# ---------------------------------------------
# Settings
# ---------------------------------------------
class Settings(BaseSettings):
    """Environment configuration."""

    github_token: str = ""
    api_key: str = ""

    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore",
    }


class XComSettings(Settings):
    x_api_key: str = ""
    x_api_secret: str = ""
    x_access_token: str = ""
    x_access_secret: str = ""

    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore",
    }


class LinkedInSettings(Settings):
    linkedin_client_id: str = ""
    linkedin_client_secret: str = ""
    linkedin_refresh_token: str = ""
    linkedin_author_urn: str = ""  # e.g. "urn:li:person:CTJGCF2Lyd"

    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
        "extra": "ignore",
    }


# ---------------------------------------------
# GitHub Client
# ---------------------------------------------
class GitHubClient:
    """Encapsulates GitHub API interactions."""

    def __init__(self, token: str):
        self.token = token
        self.headers = {"Authorization": f"token {token}"}

    def _get(self, url: str) -> dict:
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def get_repo_info(self, repo: str) -> dict:
        return self._get(f"https://api.github.com/repos/{repo}")

    def get_releases(self, repo: str) -> List[dict]:
        releases = self._get(f"https://api.github.com/repos/{repo}/releases")
        return sorted(releases, key=lambda r: r["created_at"])

    def get_diff_between_releases(self, repo: str, base_tag: str, new_tag: str) -> str:
        """Fetch commit diff and changed files between two releases."""
        url = f"https://api.github.com/repos/{repo}/compare/{base_tag}...{new_tag}"
        data = self._get(url)

        commits = [
            f"- {c['commit']['message']} ({c['commit']['author']['name']})"
            for c in data.get("commits", [])
        ]
        files = [f"- {f['filename']}" for f in data.get("files", [])]

        return (
            f"Commits between {base_tag} and {new_tag}:\n"
            + "\n".join(commits)
            + "\n\nChanged files:\n"
            + "\n".join(files)
        )


# ---------------------------------------------
# Utility Functions
# ---------------------------------------------
def get_minor_version(tag: str = "v0.0.0") -> int:
    return int(tag.split(".")[1])


def get_major_version(tag: str = "v0.0.0") -> int:
    return int(tag.split(".")[0].lstrip("v"))


# ---------------------------------------------
# Base Post Generator
# ---------------------------------------------
class BasePlatformProvider(ABC):
    """Abstract base class for platform-specific post generators."""

    def __init__(
        self,
        client: ChatOpenAI,
        repo_info: dict,
        diff_summary: str,
        base_tag: str,
        new_tag: str,
    ):
        self.platform_name = None
        self._post = str()
        self.max_char_limit = 0

        self.client = client
        self.repo_info = repo_info
        self.diff_summary = toon_encode(diff_summary)
        self.base_tag = base_tag
        self.new_tag = new_tag

        self._user_prompt = None
        self._system_prompt = None
        self.response_format = BaseModel

    @property
    def post(self) -> str:
        if self._post is None:
            raise ValueError("Post content is not generated yet.")
        return self._post

    @post.setter
    def post(self, content: str):
        if len(content) > self.max_char_limit:
            raise ValueError(
                f"Post exceeds maximum character limit of {self.max_char_limit}."
            )
        if isinstance(content, str) is False:
            raise ValueError("Post content must be a string.")
        self._post = content

    @property
    def user_prompt(self) -> str:
        if self._user_prompt is None:
            raise ValueError("User prompt is not set.")
        return self._user_prompt

    @user_prompt.setter
    def user_prompt(self, prompt: str):
        self._user_prompt = prompt

    @property
    def system_prompt(self) -> str:
        if self._system_prompt is None:
            raise ValueError("System prompt is not set.")
        return self._system_prompt

    @system_prompt.setter
    def system_prompt(self, prompt: str):
        self._system_prompt = prompt

    def generate(self) -> str:
        rprint(f"🧠 Generating {self.platform_name} Post using AI...\n")

        agent = create_agent(
            model=self.client,
            response_format=self.response_format,
        )

        result = agent.invoke(
            {
                "messages": [
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": self.user_prompt},
                ]
            }
        )

        self._create_post_content(result["structured_response"])
        return self.post

    @abstractmethod
    def _create_post_content(self, info: BaseModel) -> str:
        pass

    @abstractmethod
    def _publish(self, *args, **kawgs):
        pass

    def publish(self, *args, **kawgs):
        rprint(f"🚀 Publishing {self.platform_name} post...")
        try:
            self._publish(*args, **kawgs)
        except Exception as e:
            rprint(f"🛑 Failed to publish {self.platform_name} post: {str(e)}")
            return
        rprint(f"✅ Published {self.platform_name} post.")


# ---------------------------------------------
# X (Twitter) Post Generator
# ---------------------------------------------
class XComLLMResponse(BaseModel):
    content: str = Field(description="Generated tweet content based on the provided release information and highlights.")

class XComProvier(BasePlatformProvider):
    """Generates a Twitter thread for a new release."""

    def __init__(
        self,
        **kwargs,
    ):
        super().__init__(**kwargs)
        self.platform_name = "X (Twitter)"
        self.max_char_limit = MAX_XCOM_CHARS
        self.settings = XComSettings()
        self.response_format = XComLLMResponse

        self.user_prompt = (
            "You are a **Senior Developer Advocate** with an elegant, concise, and highly **technical voice**. "
            "Your goal is to craft a **single tweet** announcing a new software release. "
            f"The tweet must be **under {MAX_XCOM_CHARS} characters**. "
            "Focus on the most impactful *technical* feature/improvement. Use sophisticated language, unicode characters, and only one or two well-chosen emojis. "
            "End with a clear, tech-focused Call-to-Action."
        )
        self.system_prompt = f"""
Using the provided release information, generate a **single, highly-engaging tweet** that is attractive, techy, and elegant.

**Project Core Data:**
* **New Version:** `{self.new_tag}` (upgrade from `{self.base_tag}`)
* **Repository:** `{self.repo_info.get("name")}`
* **Core Value Prop:** `{self.repo_info.get("description")}`

**Technical Highlights & Changes (The Raw Data):**
{self.diff_summary}

**Constraints:**
* Use sophisticated, technical terminology.
* Employ elegant formatting (e.g., unicode characters, subtle emojis).
* **CTA:** "Explore the docs and integrate now: {LIVE_URL}."
"""
    def _create_post_content(self, info: XComLLMResponse):
        self.post=  info.content

    def _publish(self):
        oauth_client = tweepy.Client(
            consumer_key=self.settings.x_api_key,
            consumer_secret=self.settings.x_api_secret,
            access_token=self.settings.x_access_token,
            access_token_secret=self.settings.x_access_secret,
        )
        x_publisher = XPublisher(oauth_client)
        x_publisher.post_tweet(self.post)


# ---------------------------------------------
# Linkedin Post Generator
# ---------------------------------------------
class ContentModel(BaseModel):
    name: str = Field(description="Name of the feature or bug fix")
    short_description: str = Field(
        description="Short description of the feature or bug fix"
    )


class LinkedinLLMResponse(BaseModel):
    introduction: str = Field(description="Header of the Linkedin post")
    changes: List[ContentModel] = Field(
        description="List of new features, bug fixes etc."
    )
    hashtags : List[str] = Field(description="List of hastags relevant to the Linkedin Post content")
    call_to_action: str = Field(
        description="Short call-to-action encouraging readers to visit the repository, star it, and contribute (e.g., open issues or submit PRs). May include brief next steps or a link to docs."
    )
    footer: str = Field(description="Footer note of the Linkedin post")

class LinkedInProvider(BasePlatformProvider):
    """Generates a LinkedIn post for a new release."""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.platform_name = "LinkedIn"
        self.max_char_limit = MAX_LINKEDIN_CHARS
        self.settings = LinkedInSettings()
        self.response_format = LinkedinLLMResponse

        self.user_prompt = (
            "You are a **Senior Developer Advocate** with a strong, professional, and engaging voice. "
            "Write a concise LinkedIn post announcing a new software release. "
            "The tone should be informative and enthusiastic, using bullet points for clarity where needed. "
            "Avoid hashtags except 5–6 at the end. Keep it under 1300 characters."
        )
        self.system_prompt = f"""
Using the provided release information, generate the dictionary of information based on the response format.

**Project Information:**
- Version: {self.new_tag} (previous: {self.base_tag})
- Repository: {self.repo_info.get("name")}
- Description: {self.repo_info.get("description")}

**Key Changes:**
{self.diff_summary}

**Call-to-Action:**
Include something like “Explore more at {LIVE_URL}”.
"""

    def _fetch_access_token(self):
        """Fetch LinkedIn OAuth access token if needed."""
        try:
            with open("linkedin_oauth_token.json", "r") as f:
                tokens = json.loads(f.read())
                access_token = tokens.get("access_token", None)
                expires_in = tokens.get("expires_in", None)
                # check if token is expired
                today_dt = datetime.now()
                token_dt = datetime.fromtimestamp(tokens.get("created_at", 0))
                delta = today_dt - token_dt
                if expires_in and delta.total_seconds() > expires_in:
                    rprint("⚠️ Access token expired. Generating new access token.")
                    return None
                return access_token
        except FileNotFoundError:
            rprint("⚠️ No existing token found. Generating new access token.")
            return None

    def _generate_access_token(self):
        """Generate LinkedIn OAuth access token."""
        token_url = "https://www.linkedin.com/oauth/v2/accessToken"

        data = {
            "grant_type": "refresh_token",
            "refresh_token": self.settings.linkedin_refresh_token,
            "client_id": self.settings.linkedin_client_id,
            "client_secret": self.settings.linkedin_client_secret,
        }

        response = requests.post(token_url, data=data)

        if response.status_code == 200:
            tokens = response.json()
            access_token = tokens["access_token"]
            expires_in = tokens.get("expires_in", None)
            print("✅ New Access Token:", access_token)
            print("⏱️ Expires In:", expires_in, "seconds")
            # save the refresh token
            with open("linkedin_oauth_token.json", "w") as f:
                f.write(
                    json.dumps(
                        {**tokens, "created_at": int(datetime.now().timestamp())},
                        indent=4,
                    )
                )
            return tokens["access_token"]
        else:
            raise Exception(
                f"🛑 Failed to refresh token: {response.status_code} {response.text}"
            )

    def __to_bold_text(self, input_text: str) -> str:
        return "".join(BOLD_CHARS.get(c, c) for c in input_text)

    def _create_post_content(self, info: LinkedinLLMResponse) -> None:
        self.post += f"{info.introduction}\n\n"
        self.post += f"{self.__to_bold_text("What's new")}\n"
        for content in info.changes:
            self.post += (
                f"{self.__to_bold_text(content.name)} - {content.short_description}\n"
            )
        self.post += f"\n{info.call_to_action}\n"
        self.post += ' '.join(f'#{tag}' for tag in info.hashtags)
        self.post += f"\n{info.footer}"

    def _publish(self):
        """Publish the generated post on LinkedIn."""
        # Load your LinkedIn OAuth access token from settings or environment
        access_token = self._fetch_access_token()
        if not access_token:
            access_token = self._generate_access_token()
        author_urn = self.settings.linkedin_author_urn

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        }

        data = {
            "author": author_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": self.post},
                    "shareMediaCategory": "NONE",
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
        }

        response = requests.post(LINKEDIN_API_URL, headers=headers, json=data)
        if response.status_code != 201:
            raise Exception(
                f"Failed to publish LinkedIn post: {response.status_code} {response.text}"
            )
        return


# ================================================================
# X (Twitter) PUBLISHER
# ================================================================
class XPublisher:
    """Handles tweet or thread posting using X API."""

    def __init__(self, oauth_client: tweepy.Client):
        self.oauth_client = oauth_client

    def post_tweet(self, tweet: str) -> Response | None:
        print("🚀 Publishing thread to X (Twitter)...")
        try:
            response = self.oauth_client.create_tweet(text=tweet)
            rprint("✅ Thread published!")
            return Response(*response)
        except tweepy.TooManyRequests as e:
            rprint("🛑 Rate limit exceeded. Please try again later.")
        except tweepy.Forbidden as e:
            rprint(f"🛑 Tweet forbidden: {e.response.text}")
        except Exception as e:
            rprint(f"🛑 An error occurred: {str(e)}")
        return


# ---------------------------------------------
# Post Generator Factory (Factory Pattern)
# ---------------------------------------------
class PlatformProvider:
    """
    Strategy-based factory/delegate for platform providers.

    Usage:
      - Pass `platform` explicitly (e.g. "xcom", "linkedin").
      - Falls back to env var PLATFORM.
      - If neither provided, defaults to XCOM.
    """

    STRATEGIES: Dict[PlatformEnum, Type[BasePlatformProvider]] = {
        PlatformEnum.XCOM: XComProvier,
        PlatformEnum.LINKEDIN: LinkedInProvider,
    }

    def __init__(self, platform: str | PlatformEnum | None = None, **kwargs):
        # determine platform (priority: explicit arg -> env -> default XCOM)
        raw = platform or os.getenv("PLATFORM") or PlatformEnum.XCOM.value
        self.platform = (
            raw if isinstance(raw, PlatformEnum) else PlatformEnum(str(raw).lower())
        )

        provider_cls = self.STRATEGIES.get(self.platform)
        if provider_cls is None:
            raise NotImplementedError(
                f"No provider implemented for platform '{self.platform}'."
            )

        # instantiate the concrete provider strategy with provided context kwargs
        self._provider: BasePlatformProvider = provider_cls(**kwargs)

    # Delegate commonly used operations to the selected provider
    def generate(self) -> str:
        return self._provider.generate()

    def publish(self, *args, **kwargs):
        return self._provider.publish(*args, **kwargs)

    @property
    def post(self) -> str:
        return self._provider.post

    def __getattr__(self, name):
        # fallback delegation for other methods/attrs
        return getattr(self._provider, name)


# ---------------------------------------------
# Main Runner
# ---------------------------------------------
class ReleasePostApp:
    """Main application class orchestrating the workflow."""

    def __init__(self, new_release: str):
        self.settings = Settings()
        self.github = GitHubClient(self.settings.github_token)
        self.client = ChatOpenAI(
            model="openai/gpt-oss-120b",
            base_url="https://api.groq.com/openai/v1",
            api_key=lambda: self.settings.api_key,
        )
        self.new_release = (
            self.__fetch_latest_release_tag()
            if new_release == "latest"
            else new_release
        )

    def __fetch_latest_release_tag(self) -> str:
        releases = self.github.get_releases(GITHUB_REPO)
        if not releases:
            raise ValueError("No releases found in the repository.")
        latest_tag = releases[-1]["tag_name"]
        return f"v{get_major_version(latest_tag)}.{get_minor_version(latest_tag)}.0"

    def run(self):
        print(f"🚀 New release detected: {self.new_release}")
        releases = self.github.get_releases(GITHUB_REPO)
        tags = [r["tag_name"] for r in releases]

        if self.new_release not in tags:
            raise ValueError(f"Release {self.new_release} not found.")

        idx = tags.index(self.new_release)
        if idx == 0:
            print("⚠️ No previous release found.")
            return

        prev_tag = tags[idx - 1]
        prev_major = get_major_version(prev_tag)
        prev_minor = get_minor_version(prev_tag)
        prev_release = f"v{prev_major}.{prev_minor}.0"

        if prev_release not in tags:
            print(f"⚠️ Fallback to previous release {prev_tag}")
            prev_release = prev_tag

        print(f"🔍 Comparing {prev_release} → {self.new_release}")
        repo_info = self.github.get_repo_info(GITHUB_REPO)
        diff_summary = self.github.get_diff_between_releases(
            GITHUB_REPO, prev_release, self.new_release
        )

        PLATFORMS = [PlatformEnum.LINKEDIN, PlatformEnum.XCOM]

        for platform in PLATFORMS:
            rprint(f"\n🔁 Processing platform: [bold]{platform.value}[/bold]\n")

            # instantiate provider/strategy for this specific platform
            try:
                provider = PlatformProvider(
                    platform=platform,
                    client=self.client,
                    repo_info=repo_info,
                    diff_summary=diff_summary,
                    base_tag=prev_release,
                    new_tag=self.new_release,
                )
            except NotImplementedError as e:
                rprint(f"🛑 No provider for {platform.value}: {e}")
                continue

            # Generate post content using the selected strategy
            try:
                post = provider.generate()
                rprint(post, end="\n\n")
            except Exception as e:
                rprint(f"🛑 Failed to generate post for {platform.value}: {e}")
                continue

            # Confirm before publishing
            proceed = (
                input(f"✅ Proceed to publish to {platform.value}? [Y/n]: ")
                .strip()
                .lower()
            )
            if proceed and proceed != "y":
                rprint(f"🚫 Publishing cancelled for {platform.value}.")
                continue

            # Publish using the provider's publish() method
            try:
                provider.publish()
            except Exception as e:
                rprint(f"🛑 Publishing failed for {platform.value}: {e}")
                continue


# ---------------------------------------------
# CLI Entry Point
# ---------------------------------------------
def main():
    try:
        parser = argparse.ArgumentParser(
            description="Generate and publish release posts."
        )
        parser.add_argument(
            "-r",
            "--release",
            required=False,
            help="Release tag (e.g., v1.2.0, latest, etc)",
            default="latest",
        )
        args = parser.parse_args()

        ReleasePostApp(args.release).run()

    except KeyboardInterrupt:
        rprint("\n\n🛑 [bold]Keyboard Interrupt detected![/bold]")
        rprint("✅ Shutdown complete. Goodbye!")
        sys.exit(0)


if __name__ == "__main__":
    main()
