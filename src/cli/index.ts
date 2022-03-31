#!/usr/bin/env node

import { IpfsStorage } from "./../core/storage/ipfs-storage";
import { Command } from "commander";
import path from "path";
import { Logger } from "tslog";
import { Builder } from "../core/builder";
import detect from "../core/detection/detect";
import build from "../core/builder/build";

const logger = new Logger({
  name: "thirdweb-cli",
});

const main = async () => {
  const program = new Command();

  // TODO: allow overriding the default storage
  const storage = new IpfsStorage();

  program
    .name("thirdweb-cli")
    .description("Official thirdweb command line interface")
    .version("0.0.1");

  program
    .command("publish")
    .description("Bundles & publishes a project to IPFS")
    .argument("<project-name>", "name of the project")
    .option("-p, --path <project-path>", "path to project", ".")
    .action(async (projectName, options) => {
      logger.info(`Publishing project ${projectName}`);

      let projectPath = process.cwd();
      if (options.path) {
        logger.info("Overriding project path to " + options.path);

        const resolvedPath = (options.path as string).startsWith("/")
          ? options.path
          : path.resolve(`${projectPath}/${options.path}`);
        projectPath = resolvedPath;
      }

      logger.info("Publishing project at path " + projectPath);

      const projectType = await detect(projectPath);
      if (projectType === "unknown") {
        logger.error("Unable to detect project type");
        return;
      }
      logger.info("Detected project type " + projectType);

      const compiledResult = await build(projectPath, projectType);

      //   const builder = new Builder(storage);
      //   const project = await builder.compile({
      //     projectPath,
      //     name: projectName,
      //   });
      //   logger.info("Project compiled successfully,", project);

      //   const url = `https://thirdweb.com/dashboard/publish?hash=${encodeURI(
      //     project.hash
      //   )}`;

      //   logger.info(`Go to this link to publish to the registry: ${url}`);
    });

  await program.parseAsync();
};

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
