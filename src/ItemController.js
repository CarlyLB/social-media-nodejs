// @flow

// import type {Application, Request, Response} from 'express';

class ItemController {
    getItems(req: express$Request, res: express$Response): void {

        const n = 1000;
        const all = [...Array(n).keys()].map((i) => {return {id: `${i}`, name: `name-${i}`}} );


        res.json(all);
    }
};

export default ItemController