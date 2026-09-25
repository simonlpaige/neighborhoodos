# Launching a New Neighborhood

The model is designed to be repeated. Each neighborhood runs its own program and, if it wants, its own node.

## Checklist

1. **Draw the boundary.** Use a name residents actually use. Get the lat/long bounding box for the config.
2. **Find the host.** A trusted local organization with a room. Libraries, churches, schools, and community centers all work.
3. **Find two connectors.** People who can personally invite 20 neighbors.
4. **Name the lead and steward.** See [Roles and Staffing](Roles-and-Staffing.md).
5. **Adapt the materials.** Swap local examples into the session plans: real street names, real city departments, the local 311 system and open data portal.
6. **Check the data sources.** Outside Kansas City, the connectors need new dataset IDs or new connectors. Many cities use Socrata or ArcGIS Hub and Legistar; start with the city's open data portal.
7. **Run the 90 days.** [Start Here for Partners](Start-Here-for-Partners.md).
8. **Optional: stand up a node.** Copy `node.config.example.json`, set the bounds and slug, run `npm run sync`.
9. **Optional: federate.** Exchange peer keys with another neighborhood node to compare aggregate results.

## Outside Kansas City

The education program works anywhere without changes beyond local examples. The software's city connectors are Kansas City specific. Adding a city means writing a connector file shaped like `connectors/kc-open-data.js` with that city's dataset IDs and date fields.

The site's [30-day launch playbook](https://neighborhoodos.org/launch.html) is an older, more software-forward version of this checklist; prefer this page where they differ.
