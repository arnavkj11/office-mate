from openai import OpenAI
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise EnvironmentError("OPENAI_API_KEY is not set")

client = OpenAI(api_key=api_key)

def run_agent(
    message: str,
    system_prompt: Optional[str] = None,
    model: str = "gpt-4o-mini",
    timeout: int = 15,
) -> str:
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model=model,
        messages=messages,
        timeout=timeout,
    )

    msg = response.choices[0].message
    return msg.content if msg.content is not None else ""

if __name__ == "__main__":
    reply = run_agent("Say hello in one short sentence.")
    print(reply)
