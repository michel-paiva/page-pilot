import fastifyAutoload from "@fastify/autoload";
import fastify, { FastifyServerOptions } from "fastify";
import path from "path";

const build = async (opts: FastifyServerOptions = {}) => {
    const app = fastify(opts);

    app.register(fastifyAutoload, {
        dir: path.join(__dirname, "routes"),
    });

    return app;
};

export default build;