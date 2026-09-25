-- 0001_voting_salt.sql
-- Adds the per-proposal voting salt that voting.js expects.
-- body_hash stays a pure content hash; the salt used to blind voter ids lives here.
ALTER TABLE proposals ADD COLUMN voting_salt TEXT;
