// neighborhoodos/core/node.js
// NeighborhoodOS: main entry point.
// Exports the full API surface for programmatic use.
// Wires together: city data, legislative record, social signals,
// civic identity, voting, and wedge modules.

// Data connectors
export * as kcOpenData from '../connectors/kc-open-data.js';
export * as legistar from '../connectors/legistar.js';
export * as social from '../connectors/social.js';
export * as ecoDirConnector from '../connectors/commonweave-directory.js';

// Civic identity + voting
export * as identity from '../identity/identity.js';
export * as voting from '../identity/voting.js';
export * as federation from '../identity/federation.js';
export * as federationAggregate from '../identity/federation-aggregate.js';
export * as issues from '../identity/issues.js';
export * as commitments from '../identity/commitments.js';
export * as audit from '../identity/audit.js';
export * as retention from '../identity/retention.js';
export * as adminTokens from '../identity/admin-tokens.js';
export * as twoOpVerify from '../identity/two-op-verify.js';
export * as config from '../identity/config.js';
export * as ballotPdf from '../identity/ballot-pdf.js';
export * as digest from '../identity/digest.js';
export * as probe from '../ingest/probe.js';
export * as meetingsPacket from './meetings-packet.js';

// ----------------------------------------------------------------
// Convenience: spin up a full node
// ----------------------------------------------------------------

import { openDB } from '../identity/identity.js';
import { ensureLegistarTables } from '../connectors/legistar.js';
import { ensureSocialTables } from '../connectors/social.js';
import { ensureFederationTable } from '../identity/federation.js';

export function createNode({
  dbPath = './neighborhoodos.db',
  nodeSlug = 'local@neighborhoodos.local',
  bounds = null
} = {}) {
  // Open a unified DB for this node
  // Civic identity gets its own schema; all other tables co-exist
  const db = openDB(dbPath);
  ensureLegistarTables(db);
  ensureSocialTables(db);
  ensureFederationTable(db);

  return {
    db,
    nodeSlug,
    bounds,

    // Convenience accessors
    async syncCityData(datasetKey) {
      const { syncDataset } = await import('../connectors/kc-open-data.js');
      return syncDataset(db, datasetKey, bounds);
    },

    async syncLegislative(days = 14) {
      const { syncRecentMatters, syncRecentEvents } = await import('../connectors/legistar.js');
      const [matters, events] = await Promise.all([
        syncRecentMatters(db, { days }),
        syncRecentEvents(db, { days })
      ]);
      return { matters, events };
    },

    async getEcosystemRecommendations() {
      const { getEcosystemRecommendations } = await import('../connectors/commonweave-directory.js');
      return getEcosystemRecommendations(db, nodeSlug, bounds);
    },

    close() {
      db.close();
    }
  };
}
