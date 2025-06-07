import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { verifyUser } from "../../services/user";
import { errorResponse } from "../../lib/schemas/response";

const authRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post("/login", {
        schema: {
            body: z.object({
                email: z.string().email(),
                password: z.string(),
            }),
            response: {
                200: z.object({
                    token: z.string(),
                }),
                401: errorResponse,
            },
            tags: ["auth"],
        },
    }, async (request, reply) => {
        const { email, password } = request.body as { email: string; password: string };
        const user = await verifyUser(email, password);
        if (!user) {
            reply.status(401);
            return {
                error: "Invalid credentials",
                message: "Invalid credentials",
                statusCode: 401,
            };
        }
        const token = fastify.jwt.sign({ userId: user.id });
        return { token };
    });
};

export default authRoutes;