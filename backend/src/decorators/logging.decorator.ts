export function LogMethod(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(
      `Entering ${propertyKey} with arguments: ${JSON.stringify(args)}`,
    );
    const result = originalMethod.apply(this, args);
    console.log(
      `Exiting ${propertyKey} with result: ${JSON.stringify(result)}`,
    );
    return result;
  };

  return descriptor;
}
