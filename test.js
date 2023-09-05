const Replicate = require("replicate");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

async function main() {
  const output = await replicate.run(
    "stability-ai/sdxl:d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82",
    {
      input: {
        prompt: "An astronaut riding a rainbow unicorn",
      },
    },
  );
  console.log(output);
}

main();
