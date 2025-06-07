export interface BookSearchResult {
  isbn: string | null;
  coverUrl: string | null;
}

export interface OpenLibraryBook {
  isbn: string[];
  cover_i?: number;
}

export interface GoogleBookVolumeInfo {
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
  imageLinks?: {
    extraLarge?: string;
    large?: string;
    thumbnail?: string;
  };
}

export interface GoogleBook {
  volumeInfo: GoogleBookVolumeInfo;
}
