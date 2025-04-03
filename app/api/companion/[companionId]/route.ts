import prismadb from "@/lib/prismadb";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function PATCH(req: Request,
    context: { params: Promise<{ companionId: string }> }
) {

    try {
        const body = await req.json();
        const user = await currentUser();
        const { src, name, description, instructions, seed, categoryId } = body;
        const { companionId } = await context.params;

        if (!companionId) {
            return new NextResponse("Unauthorized", { status: 400 });
        }

        if (!user || !user.id || !user.firstName) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!src || !name || !description || !instructions || !seed || !categoryId) {
            return new NextResponse("Missing Required Fields", { status: 401 });
        }

        //CHECK FOR SUBSCRIPTIONS
        const companion = await prismadb.companion.update({
            where: {
                id: companionId,
                userId: user.id,
            },
            data: {
                categoryId,
                userId: user.id,
                userName: user.firstName,
                src,
                name,
                description,
                instructions,
                seed
            }
        });

        return NextResponse.json(companion);
    }
    catch (error) {
        console.log("[COMPANION_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ companionId: string }> }
) {
    try {
        const { companionId } = await context.params;
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const companion = await prismadb.companion.delete({
            where: {
                userId,
                id: companionId,
            }
        })
        return NextResponse.json(companion);
    } catch (error) {
        console.log("[COMPANION_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}