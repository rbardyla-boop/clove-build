/**
 * Future NRC / CSA machine-readable import.
 * Not implemented. Do not claim NRC integration.
 */
export type StructuredCodeFormat = "json" | "json-ld" | "xml" | "rdf";

export type StructuredCodeDocument = {
  format: StructuredCodeFormat;
  bytes: Uint8Array;
};

export type ImportedProvision = {
  family: string;
  edition: string;
  provision?: string;
  textPresent: false;
};

export interface StructuredCodeAdapter {
  importDocument(doc: StructuredCodeDocument): Promise<ImportedProvision[]>;
}

export const futureStructuredCodeAdapter: StructuredCodeAdapter = {
  async importDocument() {
    throw new Error("StructuredCodeAdapter is not implemented. No NRC machine-readable integration exists.");
  },
};
