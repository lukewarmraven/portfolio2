import { NextResponse } from "next/server";

export async function GET() {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  if (!username) {
    return NextResponse.json({ error: "Missing GITHUB_USERNAME" }, { status: 500 });
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  // GraphQL: contribution calendar + pinned repos + user stats
  const query = `
    query {
      user(login: "${username}") {
        name
        avatarUrl
        bio
        url
        followers { totalCount }
        following { totalCount }
        repositories(first: 6, orderBy: {field: STARGAZERS, direction: DESC}, privacy: PUBLIC) {
          totalCount
          nodes {
            name
            description
            url
            stargazerCount
            primaryLanguage { name color }
          }
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  });

  const json = await res.json();

  if (json.errors) {
    return NextResponse.json({ error: json.errors[0].message }, { status: 400 });
  }

  return NextResponse.json(json.data.user);
}
