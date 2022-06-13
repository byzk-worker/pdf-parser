declare module "*.html" {
  const content: any;
  export default content;
}

declare module "*.module.less" {
  const content: { [key: string]: string };
  export default content;
}
