# NeighborhoodOS Wiki (source)

Open **[Home.md](Home.md)** to start.

These pages live in the repository so they're versioned with the code and readable on GitHub without any extra setup.

To also publish them as the GitHub Wiki tab: enable Wikis in the repo settings, create any first page in the browser, then:

```bash
git clone https://github.com/simonlpaige/neighborhoodos.wiki.git
cp wiki/*.md neighborhoodos.wiki/
cd neighborhoodos.wiki
sed -i -E 's/\]\(([A-Za-z-]+)\.md\)/](\1)/g; s#\]\(\.\./#](https://github.com/simonlpaige/neighborhoodos/blob/main/#g' *.md
git add . && git commit -m "Publish wiki" && git push
```

The `sed` line converts in-repo links to wiki-style links.
