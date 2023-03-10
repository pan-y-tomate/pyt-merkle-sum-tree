"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var createMiddleNode_1 = require("./createMiddleNode");
var entry_1 = require("./entry");
function buildMerkleTreeFromEntries(entries, depth, nodes, hash) {
    // if entries is not a power of 2, fill it with zero entries
    while (entries.length < Math.pow(2, depth)) {
        entries.push(entry_1.default.ZERO_ENTRY);
    }
    // range over each level of the tree
    for (var i = 0; i < depth; i++) {
        nodes[i] = [];
        // if level is 0, the nodes are the leaves, we need to create them from the entries
        if (i === 0) {
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var entry = entries_1[_i];
                nodes[i].push(entry.computeLeaf());
            }
        }
        // else, the nodes are the middle nodes, we need to create them from the previous level
        else {
            for (var j = 0; j < nodes[i - 1].length; j += 2) {
                nodes[i].push((0, createMiddleNode_1.createMiddleNode)(nodes[i - 1][j], nodes[i - 1][j + 1], hash));
            }
        }
    }
    // return the root of the tree
    return (0, createMiddleNode_1.createMiddleNode)(nodes[depth - 1][0], nodes[depth - 1][1], hash);
}
exports.default = buildMerkleTreeFromEntries;
