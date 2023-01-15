import { Entry, Node, HashFunction} from './types';
import { createLeafNodeFromEntry, createMiddleNode } from './createNode';

export default function build(
    entries: Entry[], 
    depth : number,
    nodes : Node[][],
    hash : HashFunction
    ): Node {
    // range over each level of the tree
    for (let i = 0; i < depth; i++) {

        nodes[i] = [];
  
        // if level is 0, the nodes are the leaves, we need to create them from the entries
        if (i === 0) {
          for (let j = 0; j < entries.length; j++) {
            nodes[i].push(createLeafNodeFromEntry(entries[j], hash))
          }
        }
  
        // else, the nodes are the middle nodes, we need to create them from the previous level
        else {
          for (let j = 0; j < nodes[i-1].length; j+=2) {
            nodes[i].push(createMiddleNode(nodes[i-1][j], nodes[i-1][j+1], hash))
          }
        }
      }
  
      // return the root of the tree
      return createMiddleNode(nodes[depth-1][0], nodes[depth-1][1], hash);
  }
