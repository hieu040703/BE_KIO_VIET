import { z as baseZ } from "zod";

type ZodWithTransformBoolean = typeof baseZ & {
  transformBoolean: () => ReturnType<typeof baseZ.transform>;
};

const z = baseZ as ZodWithTransformBoolean;

if (!z.transformBoolean) {
  z.transformBoolean = () =>
    z.transform((value) => {
      if (value === true || value === "true") return true;
      if (value === false || value === "false") return false;
      return undefined;
    });
}

export { z };
export default z;
