import gzip
import json
import sys
import urllib.request

def log(s):
    print("[INFO]", s)
    sys.stdout.flush()

class TaskCluster:
    API_URL = "https://firefox-ci-tc.services.mozilla.com/api/"

    @classmethod
    def url(cls, route, artifact):
        return f"{cls.API_URL}index/v1/task/{route}/artifacts/{artifact}"

    @classmethod
    def get_actual_url(cls, route, artifact):
        url = cls.url(route, artifact)
        with urllib.request.urlopen(url) as u:
            return u.geturl()

    @classmethod
    def get_json(cls, route, artifact):
        url = cls.url(route, artifact)
        log(f"JSON URL: {url}")
        with urllib.request.urlopen(url) as u:
            data = u.read()
            if u.headers["Content-Encoding"] == "gzip":
                data = gzip.decompress(data)
            return json.loads(data)

def run():
    job_name = "spidermonkey-sm-linux64-wasi/opt"
    branches = ["mozilla-central", "mozilla-beta", "mozilla-release", "mozilla-esr140"]

    data = []
    for branch in branches:
        log(f"Fetching data for {branch}")
        route_name = f"gecko.v2.{branch}.latest.firefox.sm-linux64-wasi-opt"

        url = TaskCluster.get_actual_url(route_name, "public/build/js.wasm")
        log(f"URL: {url}")

        target_json = TaskCluster.get_json(route_name, "public/build/target.json")
        log(f"target.json: {target_json}")

        obj = {"branch": branch, "url": url, "buildid": target_json["buildid"], "rev": target_json["moz_source_stamp"]}
        data.append(obj)

    log(f"Writing data: {json.dumps(data)}")

    with open("data.json", "w") as f:
        f.write(json.dumps(data, indent=1))

run()
