import { NextResponse } from "next/server";

export async function POST(req) {
	const { query } = await req.json();

	if (!query) {
		return NextResponse.json({ error: "Query is required" }, { status: 400 });
	}

	const q = query.toLowerCase();

	if (q.includes("جواز") || q.includes("passport")) {
		return NextResponse.json({
			answer: "تم التعرف على طلبك: تجديد جواز السفر.",
			actionUrl: "/demo/passport-renew",
		});
	}

	if (q.includes("هوية") || q.includes("id")) {
		return NextResponse.json({
			answer: "تم التعرف على طلبك: تجديد الهوية الوطنية.",
			actionUrl: "/demo/id-renew",
		});
	}

	return NextResponse.json({
		answer: "هذا مجرد ديمو للتقييم. جرّب قول: جواز أو هوية.",
	});
}

