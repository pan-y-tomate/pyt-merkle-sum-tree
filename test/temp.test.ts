import { IncrementalMerkleSumTree } from "../src"

describe("Incremental Merkle Tree", () => {

    it("should create a new tree", () => {

        const pathToCsv = "test/entries/entry1.csv"
        const tree = new IncrementalMerkleSumTree(pathToCsv)

        // return entries 
        console.log(tree.entries)

        expect(tree).toBeTruthy()
    })


})