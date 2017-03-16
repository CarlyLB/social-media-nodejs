// @flow

import type {Item} from './types/definitions';

class ItemController {
    all: Item[];

    constructor(n: number = 1000) {
        this.all = [...Array(n).keys()].map((i) => {return {id: `${i}`, name: `name-${i}`}} );
    }

    getItems(req: express$Request, res: express$Response): void {
        res.json(this.all);
    }

    getItem(req: express$Request, res: express$Response): void {
        const item = this.all.find(i => i.id == req.params.id);
        if(item) {
            res.json(item);
        } else {
            res.status(404).send('Not found');
        }
    }
};

export default ItemController