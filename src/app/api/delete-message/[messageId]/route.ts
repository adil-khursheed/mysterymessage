import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { User, getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function DELETE(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  const messageId = params.messageId;

  await dbConnect();

  const session = await getServerSession(authOptions);
  const _user: User = session?.user as User;

  if (!session || !_user) {
    return Response.json(
      {
        success: false,
        message: "User not authenticated!",
      },
      { status: 401 }
    );
  }

  try {
    const updateUser = await UserModel.updateOne(
      { _id: _user._id },
      {
        $pull: {
          messages: { _id: messageId },
        },
      }
    );

    if (updateUser.modifiedCount === 0) {
      return Response.json(
        {
          message: "Message not found or already deleted",
          success: false,
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting message:", error);
    return Response.json(
      { message: "Error deleting message", success: false },
      { status: 500 }
    );
  }
}
