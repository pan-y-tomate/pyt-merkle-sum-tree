import { poseidon } from "circomlibjs"
import { IncrementalMerkleTree } from "../src"

describe("Incremental Merkle Tree", () => {
    const depth = 10
    const numberOfLeaves = 18

    for (const arity of [2]) {
        describe(`Intremental Merkle Tree (arity = ${arity})`, () => {
            let tree: IncrementalMerkleTree

            beforeEach(() => {
                tree = new IncrementalMerkleTree(poseidon, depth)
            })

            it("Should not initialize a tree with wrong parameters", () => {
                const fun1 = () => new IncrementalMerkleTree(undefined as any, 33)
                const fun2 = () => new IncrementalMerkleTree(1 as any, 33)

                expect(fun1).toThrow("Parameter 'hash' is not defined")
                expect(fun2).toThrow("Parameter 'hash' is none of these types: function")
            })


            it("Should not initialize a tree with depth > 32", () => {
                const fun = () => new IncrementalMerkleTree(poseidon, 33)

                expect(fun).toThrow("The tree depth must be between 1 and 32")
            })

            it("Should not allow to add an entry with negative sum", () => {
                const fun = () => tree.insert(BigInt(0), BigInt(-1))

                expect(fun).toThrow("entrySum cant be negative")
            })

            it("Should initialize a tree", () => {
                expect(tree.depth).toEqual(depth)
                expect(tree.zeroes).toHaveLength(depth)
                expect(tree.arity).toEqual(arity)
                expect(tree.root.sum).toEqual(BigInt(0))
            })

            it("All the zeroes should have sum equal to 0", () => {
                for (const zero of tree.zeroes) {
                    expect(zero.sum).toEqual(BigInt(0))
                }
            })

            it("Should generate the same hash using the native poseidon hash", () => {

                tree.insert(BigInt(20), BigInt(1))
                const hash = poseidon([BigInt(20), BigInt(1)])

                expect(hash).toEqual(tree.leaves[0].hash)
                expect(tree.root.sum).toEqual(BigInt(1))
            })

            it("Should generate different root hashes when changing the entry order", () => {

                const entry1Value = BigInt(1)
                const entry1Sum = BigInt(78)
                const entry2Value = BigInt(2)
                const entry2Sum = BigInt(90)

                let tree1 = new IncrementalMerkleTree(poseidon, depth)
                let tree2 = new IncrementalMerkleTree(poseidon, depth)

                tree1.insert(entry1Value, entry1Sum)
                tree1.insert(entry2Value, entry2Sum)

                tree2.insert(entry2Value, entry2Sum)
                tree2.insert(entry1Value, entry1Sum)

                expect(tree1.root.hash).not.toEqual(tree2.root.hash)
            })

            it("should initiate a empty array of leaf nodes", () => {
                expect(tree.leaves).toHaveLength(0)
            })

            it("Should not insert a leaf in a full tree", () => {
                const fullTree = new IncrementalMerkleTree(poseidon, 1)

                fullTree.insert(BigInt(0), BigInt(50))
                fullTree.insert(BigInt(1), BigInt(30))

                expect(fullTree.root.sum).toEqual(BigInt(80))

                expect(() => {
                    fullTree.insert(BigInt(2), BigInt(70))
                }).toThrow("The tree is full") // Or .toThrow('expectedErrorMessage')
                
            })

            it(`Should insert ${numberOfLeaves} leaves`, () => {

                let sum = BigInt(0)

                for (let i = 0; i < numberOfLeaves; i += 1) {
                    tree.insert(BigInt(i), BigInt(i + 1))
                    expect(tree.leaves).toHaveLength(i + 1)
                    // The leaves should be initiated with the correct value and the correct sum
                    expect(tree.leaves[i].hash).toEqual(poseidon([BigInt(i), BigInt(i + 1)]))
                    expect(tree.leaves[i].sum).toEqual(BigInt(i + 1))
                    sum += BigInt(i + 1)
                    // The root should store the correct sum
                    expect(tree.root.sum).toEqual(sum)
                }
            })

            // it("Should not delete a leaf that does not exist", () => {
            //     const fun = () => tree.delete(0)

            //     expect(fun).toThrow("The leaf does not exist in this tree")
            // })

            // it(`Should delete ${numberOfLeaves} leaves`, () => {
            //     for (let i = 0; i < numberOfLeaves; i += 1) {
            //         tree.insert(BigInt(1))
            //         oldTree.insert(BigInt(1))
            //     }

            //     for (let i = 0; i < numberOfLeaves; i += 1) {
            //         tree.delete(i)
            //         oldTree.update(i, BigInt(0))

            //         const { root } = oldTree.genMerklePath(0)

            //         expect(tree.root).toEqual(root)
            //     }
            // })

            // it(`Should update ${numberOfLeaves} leaves`, () => {
            //     for (let i = 0; i < numberOfLeaves; i += 1) {
            //         tree.insert(BigInt(1))
            //         oldTree.insert(BigInt(1))
            //     }

            //     for (let i = 0; i < numberOfLeaves; i += 1) {
            //         tree.update(i, BigInt(0))
            //         oldTree.update(i, BigInt(0))

            //         const { root } = oldTree.genMerklePath(0)

            //         expect(tree.root).toEqual(root)
            //     }
            // })

            // it("Should return the index of a leaf", () => {
            //     tree.insert(BigInt(1))
            //     tree.insert(BigInt(2))

            //     const index = tree.indexOf(BigInt(2))

            //     expect(index).toBe(1)
            // })

            // it("Should not create any proof if the leaf does not exist", () => {
            //     tree.insert(BigInt(1))

            //     const fun = () => tree.createProof(1)

            //     expect(fun).toThrow("The leaf does not exist in this tree")
            // })

            // it("Should create a valid proof", () => {
            //     for (let i = 0; i < numberOfLeaves; i += 1) {
            //         tree.insert(BigInt(i + 1))
            //     }

            //     for (let i = 0; i < numberOfLeaves; i += 1) {
            //         const proof = tree.createProof(i)
            //         expect(tree.verifyProof(proof)).toBeTruthy()
            //     }
            // })
        })
    }
})