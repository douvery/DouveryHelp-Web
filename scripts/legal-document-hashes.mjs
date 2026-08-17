#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const allowDirty = args.includes("--allow-dirty");
const writeIndex = args.indexOf("--write");
const writePath = writeIndex >= 0 ? args[writeIndex + 1] : null;

const DOCUMENTS = [
  {
    documentKey: "TERMS_OF_USE",
    path: "legal/policy/terms-of-use-of-douvery.mdx",
    canonicalUrl: "https://help.douvery.com/legal/policy/terms-of-use-of-douvery",
  },
  {
    documentKey: "PRIVACY_POLICY",
    path: "legal/policy/privacy-policy.mdx",
    canonicalUrl: "https://help.douvery.com/legal/policy/privacy-policy",
  },
  {
    documentKey: "PURCHASE_TERMS",
    path: "legal/policy/purchase-terms.mdx",
    canonicalUrl: "https://help.douvery.com/legal/policy/purchase-terms",
  },
  {
    documentKey: "SELLER_POLICY",
    path: "legal/policy/seller-policy.mdx",
    canonicalUrl: "https://help.douvery.com/legal/policy/seller-policy",
  },
  {
    documentKey: "DOUVERY_CENTER_TERMS",
    path: "legal/policy/douvery-center-subscription-terms.mdx",
    canonicalUrl: "https://help.douvery.com/legal/policy/douvery-center-subscription-terms",
  },
  {
    documentKey: "COOKIE_POLICY",
    path: "legal/policy/cookies-and-tracking-technologies.mdx",
    canonicalUrl: "https://help.douvery.com/legal/policy/cookies-and-tracking-technologies",
  },
  {
    documentKey: "RETURNS_REFUNDS",
    path: "legal/policy/returns-and-refunds-policy-of-douvery.mdx",
    canonicalUrl: "https://help.douvery.com/legal/policy/returns-and-refunds-policy-of-douvery",
  },
  {
    documentKey: "WARRANTY_POLICY",
    path: "legal/policy/warranty-policy.mdx",
    canonicalUrl: "https://help.douvery.com/legal/policy/warranty-policy",
  },
  {
    documentKey: "PAYMENT_POLICY",
    path: "legal/policy/payment-policy.mdx",
    canonicalUrl: "https://help.douvery.com/legal/policy/payment-policy",
  },
  {
    documentKey: "SHIPPING_POLICY",
    path: "legal/policy/shipping-policy.mdx",
    canonicalUrl: "https://help.douvery.com/legal/policy/shipping-policy",
  },
  {
    documentKey: "UGC_POLICY",
    path: "legal/policy/user-generated-content-policy.mdx",
    canonicalUrl: "https://help.douvery.com/legal/policy/user-generated-content-policy",
  },
];

function git(...gitArgs) {
  const result = spawnSync("git", gitArgs, {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`git ${gitArgs.join(" ")} failed: ${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

let gitCommit;
try {
  gitCommit = git("rev-parse", "HEAD");
  const dirty = git("status", "--porcelain", "--untracked-files=normal");
  if (dirty && !allowDirty) {
    console.error(
      "[legal-hashes] BLOCKED: working tree is dirty. Commit the exact approved MDX first or pass --allow-dirty only for local investigation.",
    );
    process.exit(1);
  }
} catch (error) {
  console.error(`[legal-hashes] BLOCKED: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const documents = [];
for (const document of DOCUMENTS) {
  const absolutePath = resolve(ROOT, document.path);
  if (!existsSync(absolutePath)) {
    console.error(`[legal-hashes] BLOCKED: missing ${document.path}`);
    process.exit(1);
  }
  const bytes = readFileSync(absolutePath);
  documents.push({
    ...document,
    byteLength: bytes.byteLength,
    contentHashSha256: sha256(bytes),
  });
}

const manifest = {
  schemaVersion: 1,
  hashContract: "sha256-exact-git-working-tree-file-bytes",
  repository: "douvery/DouveryHelp-Web",
  gitCommit,
  generatedAt: new Date().toISOString(),
  cleanWorkingTreeRequired: !allowDirty,
  documents,
};

const json = `${JSON.stringify(manifest, null, 2)}\n`;
if (writeIndex >= 0) {
  if (!writePath) {
    console.error("[legal-hashes] BLOCKED: --write requires an output path");
    process.exit(1);
  }
  writeFileSync(resolve(process.cwd(), writePath), json, "utf8");
}
process.stdout.write(json);
