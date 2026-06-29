from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys


class SpaHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if not Path(path).exists() and "." not in Path(self.path.split("?", 1)[0]).name:
            self.path = "/index.html"
        return super().send_head()


def main():
    directory = Path(sys.argv[1]).resolve()
    port = int(sys.argv[2])

    class Handler(SpaHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(directory), **kwargs)

    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Serving {directory} on http://127.0.0.1:{port}/", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
