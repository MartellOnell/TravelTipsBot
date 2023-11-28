from bs4 import BeautifulSoup as bsf
import json
import requests
from pathlib import Path
SITE_URL = "https://www.neverendingfootsteps.com/one-hundred-travel-tips/"
PATH_OF_FILE = f"{Path.cwd()}"
PATH_OF_DATA = PATH_OF_FILE + "/data.json"

page = requests.get(SITE_URL)
soup = bsf(page.text, "html.parser")
content = soup.findAll('h3', class_='wp-block-heading')
result = []
for data in content:
    if data.find('img') is None:
        result.append("{"+f'"value": "{data.text}"'+"}")

with open(PATH_OF_DATA, "w") as outfile:
    outfile.write(f"[{','.join(result)}]")
