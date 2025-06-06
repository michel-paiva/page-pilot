import fastifyAutoload from "@fastify/autoload";
import fastify, { FastifyServerOptions } from "fastify";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import path from "path";

const build = async (opts: FastifyServerOptions = {}) => {
    const app = fastify(opts);

    app.register(fastifyAutoload, {
        dir: path.join(__dirname, "routes"),
    });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    app.setErrorHandler((error, request, reply) => {
        if (error.code === "FST_ERR_VALIDATION") {
            let statusCode = error.statusCode ?? 400;

            if (["POST", "PUT"].includes(request.method)) {
                statusCode = 422;
            }

            reply.status(statusCode).send({
                message: error.message,
                error: "Validation error",
                statusCode,
            });
        } else {
            reply.send(error);
        }
    });

    return app.withTypeProvider<ZodTypeProvider>();
};

export default build;