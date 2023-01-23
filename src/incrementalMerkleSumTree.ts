import checkParameter from './checkParameter';
import { poseidon } from 'circomlibjs';
import _createProof from './createProof';
import _build from './build';
import _indexOf from './indexOf';
import { HashFunction, MerkleProof, Node, Entry } from './types';
import Utils from './utils';
import _verifyProof from './verifyProof';

/**
 * A Merkle Sum Tree is a binary Merkle Tree with the following properties:
 * - Each entry of a Merkle Sum Tree is a pair of a value and a sum.
 * - Each Leaf Node contains a hash and a sum. The hash is equal to H(value, sum). The sum is equal to the sum itself.
 * - Each Middle Node contains a hash and a sum. The hash is equal to H(LeftChild.hash, LeftChild.sum, RightChild.hash, RightChild.sum). The sum is equal to the sum of the sums of its children.
 * - The Root Node represents the committed state of the Tree and contains the sum of all the entries' sums.
 * The IncrementalMerkleSumTree class is a TypeScript implementation of Incremental Merkle Sum tree and it
 * provides all the functions to create efficient trees and to generate and verify proofs of membership.
 */

export default class IncrementalMerkleSumTree {
  static readonly maxDepth = 32;
  private _root: Node;
  private readonly _nodes: Node[][];
  private readonly _hash: HashFunction;
  private readonly _depth: number;
  private readonly _arity: number;
  private readonly _entries: Entry[];

  /**
   * Initializes the tree with the csv file containing the entries of the tree.
   * @param path path to the csv file storing the entries.
   */
  constructor(path: string) {
    checkParameter(path, 'path', 'string');

    // Initialize the attributes.
    this._hash = poseidon;
    this._nodes = [];
    this._arity = 2;
    this._entries = Utils.parseCsv(path);

    // get the depth of the tree from the log base 2 of the number of entries rounded to the next integer
    this._depth = Math.ceil(Math.log2(this._entries.length));

    if (this._depth < 1 || this._depth > IncrementalMerkleSumTree.maxDepth) {
      throw new Error('The tree depth must be between 1 and 32');
    }

    // Build the tree
    this._root = this._build(this._entries);

    // Freeze the entries. It prevents unintentional changes.
    Object.freeze(this._entries);

    // Freeze the tree. It prevents unintentional changes.
    Object.freeze(this._root);
    Object.freeze(this._nodes);
  }

  /**
   * Returns the root hash of the tree.
   * @returns Root hash.
   */
  public get root(): Node {
    return this._root;
  }

  /**
   * Returns the depth of the tree.
   * @returns Tree depth.
   */
  public get depth(): number {
    return this._depth;
  }

  /**
   * Returns the leaves of the tree.
   * @returns List of leaves.
   */
  public get leaves(): Node[] {
    return this._nodes[0].slice();
  }

  /**
   * Returns the number of children for each node.
   * @returns Number of children per node.
   */
  public get arity(): number {
    return this._arity;
  }

  /**
   * Returns the entries of the tree.
   * @returns List of entries.
   */
  public get entries(): Entry[] {
    return this._entries;
  }

  /**
   * Returns the index of a leaf. If the leaf does not exist it returns -1.
   * @param username username of the queried entry.
   * @param balance balance of the queried entry.
   * @returns Index of the leaf.
   */
  public indexOf(username: string, balance: bigint): number {
    return _indexOf(username, balance, this._nodes, this._hash);
  }

  /**
   * Build the merkle tree from a list of entries.
   * @param entries array of the entries to be added to the tree.
   */
  _build(entries: Entry[]) {
    return _build(entries, this._depth, this._nodes, this._hash);
  }

  /**
   * Creates a proof of membership. The MerkleProof contains the path from the leaf to the root.
   * @param index Index of the proof's leaf.
   * @returns MerkleProof object.
   */
  public createProof(index: number): MerkleProof {
    return _createProof(index, this.entries, this.depth, this.arity, this._nodes, this.root);
  }

  /**
   * Verifies a proof and return true or false.
   * It verifies that a leaf is included in the tree and that the sum computed from the leaf to the root is equal to the total sum of the tree.
   * @param proof Proof to be verified.
   * @returns True or false.
   */
  public verifyProof(proof: MerkleProof): boolean {
    return _verifyProof(proof, this._hash);
  }
}