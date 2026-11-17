import com.faiz.alive.NotionLink;

/** Build gate for NotionLink: real Notion links pass, look-alikes and non-https links fail. */
public class NotionSim {
    static int fails = 0;
    static void ok(String u) { String p = NotionLink.problem(u); if (p != null) { fails++; System.out.println("should pass: " + u + " -> " + p); } }
    static void bad(String u) { if (NotionLink.problem(u) == null) { fails++; System.out.println("should fail: " + u); } }

    public static void main(String[] a) {
        if (!NotionLink.DEFAULT.isEmpty()) ok(NotionLink.DEFAULT);
        ok("https://www.notion.so/My-Page-0123456789abcdef0123456789abcdef");
        ok("https://notion.so/workspace/Board-0123456789abcdef0123456789abcdef?v=1");
        ok("https://example.notion.site/Cockpit-abc");
        ok("  https://www.notion.com/p/x  ");
        ok("HTTPS://WWW.NOTION.SO/x");
        bad(null); bad(""); bad("   ");
        bad("http://www.notion.so/x");             // not https
        bad("notion.so/x");                        // no scheme
        bad("javascript:alert(1)");
        bad("file:///sdcard/x");
        bad("intent://notion.so#Intent;end");
        bad("https://notion.so.evil.com/x");       // look-alike suffix
        bad("https://evilnotion.so/x");            // look-alike prefix
        bad("https://user@notion.so/x");           // userinfo trick
        bad("https://evil.com\\@notion.so/");      // backslash parser confusion
        bad("https://evil.com#@notion.so");
        bad("https://evil.com?x=.notion.so");
        bad("https://notion.so:8443/x");           // odd port
        bad("https://notion.so/a b");
        bad("https://notion.so/\u0000x");
        bad("https://" + "a".repeat(2050) + ".notion.so");
        System.out.println(fails == 0 ? "ALL NOTION LINK CHECKS PASSED" : fails + " NOTION LINK CHECKS FAILED");
        System.exit(fails == 0 ? 0 : 1);
    }
}
