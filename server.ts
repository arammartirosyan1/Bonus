import { Middleware, Status } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { Application, exists, Router, send } from "./shared/deps.ts";
const { readTextFile } = Deno;

const app = new Application();
const router = new Router();

// Define the middleware function
const secretMiddleware: Middleware = async (ctx, next) => {
  // Retrieve the value of the "secret" parameter from the query string
  const secretParam = ctx.request.url.searchParams.get("secret");

  // Check if the "secret" parameter is present and equal to __
  if (secretParam === "57964aa2-6c3e-4710-8881-e1da54eb3938") {
    // Allow the route to proceed to the next middleware or route handler
    await next();
  } else {
    // Respond with a "Forbidden" message if the condition is not met
    ctx.response.body = "Forbidden";
    ctx.response.status = Status.Forbidden;
  }
};

router
  .get("/:id", secretMiddleware, async (ctx) => {
    let htmlContent = await readTextFile("./static/index.html");

    const { id } = ctx.params;

    const url =
      "https://prod-108.westeurope.logic.azure.com:443/workflows/cbf9f189541f4b38a1c0204570933932/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=j19ZpP6zcDynbRqaKNmYcnEGkt5WcydmJxeQyedj804";
    const body = `{"id": "${id}"}`;

    console.log(body);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Secret": "57964aa2-6c3e-4710-8881-e1da54eb3938",
      },
      body,
    });

    if (!response.ok) console.log("issue");

    const formData = await response.json();
    console.log(formData);

    // Populate the fields based on input names
    Object.entries(formData).forEach(([name, value]) => {
      const inputName = `name="${name}"`;
      const regex = new RegExp(`<input([^>]*)${inputName}([^>]*)>`);
      let additional;

      if (
        name == "married" || name == "divorced" || name == "service" ||
        name == "driving-license" || name == "conviction"
      ) {
        additional = "checked";
      } else additional = "";

      if (regex.test(htmlContent)) {
        const replacement =
          `<input$1${inputName} value="${value}" ${additional}$2>`;
        htmlContent = htmlContent.replace(regex, replacement);
      }
    });

    // Populate the fields based on textareas
    Object.entries(formData).forEach(([name, value]) => {
      const textareaName = `name="${name}"`;
      const regex = new RegExp(
        `<textarea([^>]*)${textareaName}([^>]*)>(.*?)<\/textarea>`,
        "s",
      );

      if (regex.test(htmlContent)) {
        const replacement = `<textarea$1${textareaName}$2>${value}</textarea>`;
        htmlContent = htmlContent.replace(regex, replacement);
      }
    });

    const regex = /<script\s+src="scripts\/new\.js"><\/script>/;
    // Replacement string with the updated src attribute
    const replacement = '<script src="scripts/save.js"></script>';
    // Use replace method with the regex
    htmlContent = htmlContent.replace(regex, replacement);

    // Replace image field
    const inputId = `id="selectedImage"`;
    const regexImg = new RegExp(`<img([^>]*)${inputId}([^>]*)>`);
    const replacementImg = `<img$1${inputId} src="${formData.picture}"$2>`;
    htmlContent = htmlContent.replace(regexImg, replacementImg);

    // Set the modified HTML content as the response body
    ctx.response.body = htmlContent;
  });

// Serve static files or let the router handle the request
app.use(async (ctx, next) => {
  const staticPath = `${Deno.cwd()}/static${ctx.request.url.pathname}`;

  if (await exists(staticPath)) {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/static`,
      index: "index.html",
    });
  } else {
    await next(); // Let the router handle the request
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
