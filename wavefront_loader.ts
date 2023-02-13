export function load_wavefront(obj_file: string) {
    //TODO: o [objectname], g [groupname]
    const lines: string[][] = obj_file.split(/[\r\n]/).filter(line => line.length).map(line => line.split(" "));
    let a_pos_i: number[] = [];
    let a_uv_i: number[] = [];
    let a_pos: number[] = [];
    let a_uv: number[] = [];
    function push_indexed(indices: string) {
        const [pos_i,uv_i] = indices.split("/").map(Number).map(x => x-1);
        a_pos.push(...a_pos_i.slice(pos_i*3,pos_i*3 + 3));
        a_uv.push(...a_uv_i.slice(uv_i<<1,(uv_i<<1) + 2))
    }
    for (const line of lines) {
        switch (line[0]) {
            case "v":
                a_pos_i.push(...line.slice(1).map((val, _idx, _arr) => Number(val)));
                break;
            case "vt":
                a_uv_i.push(...line.slice(1).map((val, _idx, _arr) => Number(val)));
                break;
            case "f":
                if (line.length === 4)
                    for (const idxes of line.slice(1))
                      push_indexed(idxes)
                else {
                    const quad = line.slice(1);
                    push_indexed(quad[0]);
                    push_indexed(quad[1]);
                    push_indexed(quad[2]);
                    push_indexed(quad[0]);
                    push_indexed(quad[2]);
                    push_indexed(quad[3]);
                }
                break;
        }
    }
    console.log(a_pos);
    console.log(a_uv);
    return {
        a_pos:{numComponents:3,data:a_pos},
        a_uv:{numComponents:2,data:a_uv},
    }
}