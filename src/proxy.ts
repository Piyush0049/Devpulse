import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: ["/dashboard/:path*", "/ask/:path*", "/debt/:path*", "/prs/:path*", "/risks/:path*"],
};
