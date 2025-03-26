
// vs extension: boyswan.glsl-literal
export function glsl(this: any, code: TemplateStringsArray, ..._args: any[]): (opts?: any) => string {
    const regex = /<(\w+)>/g;
    const glslCode = code as any;
    let match;
    const placeholders = new Set();
    while (match = regex.exec(glslCode)) placeholders.add(match[1]);
    const minified = glslCode
        .split("\n")
        .map((line: string) => line.split("//")[0])
        .filter((line: string) => line.trim())
        .join("")
        .replaceAll(/\s+/g, " ")
        .replaceAll(/(?<=[;\*\^\-\/={}\)\(+,&?:]|>>|>=|<=|<<|\s<|\s>)\s|\s(?=[;\*\^\-\/={}\)\(+,&?:]|>>|>=|<=|<<|<\s|>\s)/g, "")
        .trim()
    return new String(`(opts={}) => Object.entries(opts).reduce((p, [k, v]) => p.replaceAll("<"+k+">", v), \`${minified}\`)`) as any;
}