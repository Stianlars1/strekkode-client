import { Params } from "next/dist/shared/lib/router/utils/route-matcher";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: Params }) {
  const team = context.params.strekkode;
  const test = request.body;

  return NextResponse.json({ message: "NextResponse OK" }, { status: 200 });

  //const team = context.params.strekkode;
}
export async function HEAD(request: Request) {}

export async function POST(request: Request) {}

export async function PUT(request: Request) {}

export async function DELETE(request: Request) {}

export async function PATCH(request: Request) {}
