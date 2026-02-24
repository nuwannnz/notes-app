export const userPK = (uid: string) => `USER#${uid}`
export const noteSK = (id: string) => `NOTE#${id}`
export const notePK = (id: string) => `NOTE#${id}`
export const blockSK = (pos: number, id: string) => `BLOCK#${String(pos).padStart(6, '0')}#${id}`
export const folderSK = (id: string) => `FOLDER#${id}`
export const projectSK = (id: string) => `PROJECT#${id}`
export const projectPK = (id: string) => `PROJECT#${id}`
export const taskSK = (id: string) => `TASK#${id}`
