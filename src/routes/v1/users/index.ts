import { FastifyPluginAsync } from "fastify";
import { User } from "../../../generated/prisma";
import { createUser, getUserByEmailWithoutPassword } from "../../../services/user";
import { userInputSchema, userSchema } from "../../../lib/schemas/user";
import { errorResponse } from "../../../lib/schemas/response";

const userRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/", {
        schema: {
            body: userInputSchema,
            response: {
                201: userSchema.omit({ password: true }),
                422: errorResponse,
                400: errorResponse,
            },
            tags: ["users"],
        }
    }, async (request, reply) => {
        const {passwordConfirmation, ...body} = request.body as { passwordConfirmation: string } & User;

        const user = body as User;

        const existingUser = await getUserByEmailWithoutPassword(user.email);
        if (existingUser) {
            reply.status(400);
            return {
                error: "User already exists",
                message: "User already exists",
                statusCode: 400,
            };
        }

        const newUser = await createUser(user);
        reply.status(201);
        return newUser;
    });
}

export default userRoutes;

