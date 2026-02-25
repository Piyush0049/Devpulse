import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session || !session.accessToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch repositories" }, { status: response.status });
        }

        const repos = await response.json();
        const formattedRepos = repos.map((repo: any) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            url: repo.html_url,
            stars: repo.stargazers_count,
            language: repo.language,
            updatedAt: repo.updated_at,
            private: repo.private,
        }));

        return NextResponse.json({ repos: formattedRepos });
    } catch (error) {
        console.error("Fetch repos error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
