import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JobSiteFormDisclosure } from "./job-site-form-disclosure";

describe("JobSiteFormDisclosure", () => {
  it("presenta lo strumento chiuso con contesto e relazioni accessibili", () => {
    const html = renderToStaticMarkup(
      <JobSiteFormDisclosure
        description="Il file verrà collegato automaticamente alla richiesta."
        triggerLabel="Allega un file alla richiesta"
      >
        <form><label htmlFor="file-test">File</label><input id="file-test" type="file" /></form>
      </JobSiteFormDisclosure>,
    );

    expect(html).toContain("Allega un file alla richiesta");
    expect(html).toContain("Il file verrà collegato automaticamente alla richiesta.");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('hidden=""');
    expect(html).toContain("transition-none");
  });
});
