declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

// This empty export is needed to treat this file as a module
export {};
