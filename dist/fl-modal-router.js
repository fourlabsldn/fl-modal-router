
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};
	for (var key in oldRecord)
	{
		var value = (key in updatedFields) ? updatedFields[key] : oldRecord[key];
		newRecord[key] = value;
	}
	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		var name = v.func ? v.func.name : v.name;
		return '<function' + (name === '' ? '' : ':') + name + '>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p0) {
		var _p1 = _p0;
		return A2(f, _p1._0, _p1._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$snd = function (_p2) {
	var _p3 = _p2;
	return _p3._1;
};
var _elm_lang$core$Basics$fst = function (_p4) {
	var _p5 = _p4;
	return _p5._0;
};
var _elm_lang$core$Basics$always = F2(
	function (a, _p6) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$Never = function (a) {
	return {ctor: 'Never', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$oneOf = function (maybes) {
	oneOf:
	while (true) {
		var _p1 = maybes;
		if (_p1.ctor === '[]') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var _p3 = _p1._0;
			var _p2 = _p3;
			if (_p2.ctor === 'Nothing') {
				var _v3 = _p1._1;
				maybes = _v3;
				continue oneOf;
			} else {
				return _p3;
			}
		}
	}
};
var _elm_lang$core$Maybe$andThen = F2(
	function (maybeValue, callback) {
		var _p4 = maybeValue;
		if (_p4.ctor === 'Just') {
			return callback(_p4._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p5 = maybe;
		if (_p5.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p5._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p6 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p6.ctor === '_Tuple2') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p6._0._0, _p6._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p7 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p7.ctor === '_Tuple3') && (_p7._0.ctor === 'Just')) && (_p7._1.ctor === 'Just')) && (_p7._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p7._0._0, _p7._1._0, _p7._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p8 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p8.ctor === '_Tuple4') && (_p8._0.ctor === 'Just')) && (_p8._1.ctor === 'Just')) && (_p8._2.ctor === 'Just')) && (_p8._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p8._0._0, _p8._1._0, _p8._2._0, _p8._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p9 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p9.ctor === '_Tuple5') && (_p9._0.ctor === 'Just')) && (_p9._1.ctor === 'Just')) && (_p9._2.ctor === 'Just')) && (_p9._3.ctor === 'Just')) && (_p9._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p9._0._0, _p9._1._0, _p9._2._0, _p9._3._0, _p9._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}


function range(lo, hi)
{
	var list = Nil;
	if (lo <= hi)
	{
		do
		{
			list = Cons(hi, list);
		}
		while (hi-- > lo);
	}
	return list;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,
	range: range,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return _elm_lang$core$Basics$not(
			A2(
				_elm_lang$core$List$any,
				function (_p2) {
					return _elm_lang$core$Basics$not(
						isOkay(_p2));
				},
				list));
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			_elm_lang$core$Native_List.range(
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return A2(
						_elm_lang$core$List_ops['::'],
						f(x),
						acc);
				}),
			_elm_lang$core$Native_List.fromArray(
				[]),
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (x, xs$) {
				return pred(x) ? A2(_elm_lang$core$List_ops['::'], x, xs$) : xs$;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			_elm_lang$core$Native_List.fromArray(
				[]),
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return A2(_elm_lang$core$List_ops['::'], _p10._0, xs);
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			_elm_lang$core$Native_List.fromArray(
				[]),
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return A2(_elm_lang$core$List_ops['::'], x, y);
			}),
		_elm_lang$core$Native_List.fromArray(
			[]),
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return A2(
						_elm_lang$core$List_ops['::'],
						A2(f, x, _p11._0),
						accAcc);
				} else {
					return _elm_lang$core$Native_List.fromArray(
						[]);
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				_elm_lang$core$Native_List.fromArray(
					[b]),
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return A2(_elm_lang$core$List_ops['::'], x, y);
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		_elm_lang$core$Native_List.fromArray(
			[]),
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: A2(_elm_lang$core$List_ops['::'], x, _p16),
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: A2(_elm_lang$core$List_ops['::'], x, _p15)
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_List.fromArray(
					[]),
				_1: _elm_lang$core$Native_List.fromArray(
					[])
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: A2(_elm_lang$core$List_ops['::'], _p19._0, _p20._0),
				_1: A2(_elm_lang$core$List_ops['::'], _p19._1, _p20._1)
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_List.fromArray(
				[]),
			_1: _elm_lang$core$Native_List.fromArray(
				[])
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return _elm_lang$core$Native_List.fromArray(
				[]);
		} else {
			var step = F2(
				function (x, rest) {
					return A2(
						_elm_lang$core$List_ops['::'],
						sep,
						A2(_elm_lang$core$List_ops['::'], x, rest));
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				_elm_lang$core$Native_List.fromArray(
					[]),
				_p21._1);
			return A2(_elm_lang$core$List_ops['::'], _p21._0, spersed);
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = A2(_elm_lang$core$List_ops['::'], _p22._0, taken);
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				_elm_lang$core$Native_List.fromArray(
					[])));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return _elm_lang$core$Native_List.fromArray(
				[]);
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return _elm_lang$core$Native_List.fromArray(
											[_p23._1._0, _p23._1._1._0]);
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return _elm_lang$core$Native_List.fromArray(
												[_p23._1._0, _p23._1._1._0, _p23._1._1._1._0]);
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? A2(
												_elm_lang$core$List_ops['::'],
												_p26,
												A2(
													_elm_lang$core$List_ops['::'],
													_p27,
													A2(
														_elm_lang$core$List_ops['::'],
														_p28,
														A2(
															_elm_lang$core$List_ops['::'],
															_p25,
															A2(_elm_lang$core$List$takeTailRec, n - 4, _p24))))) : A2(
												_elm_lang$core$List_ops['::'],
												_p26,
												A2(
													_elm_lang$core$List_ops['::'],
													_p27,
													A2(
														_elm_lang$core$List_ops['::'],
														_p28,
														A2(
															_elm_lang$core$List_ops['::'],
															_p25,
															A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)))));
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return _elm_lang$core$Native_List.fromArray(
					[_p23._1._0]);
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = A2(_elm_lang$core$List_ops['::'], value, result),
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			_elm_lang$core$Native_List.fromArray(
				[]),
			n,
			value);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		_elm_lang$core$Native_List.range(
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(task, callback)
{
	return {
		ctor: '_Task_andThen',
		task: task,
		callback: callback
	};
}

function onError(task, callback)
{
	return {
		ctor: '_Task_onError',
		task: task,
		callback: callback
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function addPublicModule(object, name, main)
{
	var init = main ? makeEmbed(name, main) : mainIsUndefined(name);

	object['worker'] = function worker(flags)
	{
		return init(undefined, flags, false);
	}

	object['embed'] = function embed(domNode, flags)
	{
		return init(domNode, flags, true);
	}

	object['fullscreen'] = function fullscreen(flags)
	{
		return init(document.body, flags, true);
	};
}


// PROGRAM FAIL

function mainIsUndefined(name)
{
	return function(domNode)
	{
		var message = 'Cannot initialize module `' + name +
			'` because it has no `main` value!\nWhat should I show on screen?';
		domNode.innerHTML = errorHtml(message);
		throw new Error(message);
	};
}

function errorHtml(message)
{
	return '<div style="padding-left:1em;">'
		+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
		+ '<pre style="padding-left:1em;">' + message + '</pre>'
		+ '</div>';
}


// PROGRAM SUCCESS

function makeEmbed(moduleName, main)
{
	return function embed(rootDomNode, flags, withRenderer)
	{
		try
		{
			var program = mainToProgram(moduleName, main);
			if (!withRenderer)
			{
				program.renderer = dummyRenderer;
			}
			return makeEmbedHelp(moduleName, program, rootDomNode, flags);
		}
		catch (e)
		{
			rootDomNode.innerHTML = errorHtml(e.message);
			throw e;
		}
	};
}

function dummyRenderer()
{
	return { update: function() {} };
}


// MAIN TO PROGRAM

function mainToProgram(moduleName, wrappedMain)
{
	var main = wrappedMain.main;

	if (typeof main.init === 'undefined')
	{
		var emptyBag = batch(_elm_lang$core$Native_List.Nil);
		var noChange = _elm_lang$core$Native_Utils.Tuple2(
			_elm_lang$core$Native_Utils.Tuple0,
			emptyBag
		);

		return _elm_lang$virtual_dom$VirtualDom$programWithFlags({
			init: function() { return noChange; },
			view: function() { return main; },
			update: F2(function() { return noChange; }),
			subscriptions: function () { return emptyBag; }
		});
	}

	var flags = wrappedMain.flags;
	var init = flags
		? initWithFlags(moduleName, main.init, flags)
		: initWithoutFlags(moduleName, main.init);

	return _elm_lang$virtual_dom$VirtualDom$programWithFlags({
		init: init,
		view: main.view,
		update: main.update,
		subscriptions: main.subscriptions,
	});
}

function initWithoutFlags(moduleName, realInit)
{
	return function init(flags)
	{
		if (typeof flags !== 'undefined')
		{
			throw new Error(
				'You are giving module `' + moduleName + '` an argument in JavaScript.\n'
				+ 'This module does not take arguments though! You probably need to change the\n'
				+ 'initialization code to something like `Elm.' + moduleName + '.fullscreen()`'
			);
		}
		return realInit();
	};
}

function initWithFlags(moduleName, realInit, flagDecoder)
{
	return function init(flags)
	{
		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Err')
		{
			throw new Error(
				'You are trying to initialize module `' + moduleName + '` with an unexpected argument.\n'
				+ 'When trying to convert it to a usable Elm value, I run into this problem:\n\n'
				+ result._0
			);
		}
		return realInit(result._0);
	};
}


// SETUP RUNTIME SYSTEM

function makeEmbedHelp(moduleName, program, rootDomNode, flags)
{
	var init = program.init;
	var update = program.update;
	var subscriptions = program.subscriptions;
	var view = program.view;
	var makeRenderer = program.renderer;

	// ambient state
	var managers = {};
	var renderer;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var results = init(flags);
		var model = results._0;
		renderer = makeRenderer(rootDomNode, enqueue, view(model));
		var cmds = results._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			renderer.update(view(model));
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, handleMsg, loop);
	}

	var task = A2(andThen, init, loop);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			var value = converter(cmdList._0);
			for (var i = 0; i < subs.length; i++)
			{
				subs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		var value = result._0;
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		currentSend(incomingValue);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	mainToProgram: mainToProgram,
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,
	addPublicModule: addPublicModule,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (result, callback) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$formatError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_p1._0,
				_elm_lang$core$Platform$sendToApp(router)));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (f, task) {
		return A2(
			_elm_lang$core$Task$onError,
			task,
			function (err) {
				return _elm_lang$core$Task$fail(
					f(err));
			});
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			taskA,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			});
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			taskA,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					taskB,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					});
			});
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			taskA,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					taskB,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							taskC,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							});
					});
			});
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			taskA,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					taskB,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							taskC,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									taskD,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									});
							});
					});
			});
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			taskA,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					taskB,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							taskC,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									taskD,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											taskE,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											});
									});
							});
					});
			});
	});
var _elm_lang$core$Task$andMap = F2(
	function (taskFunc, taskValue) {
		return A2(
			_elm_lang$core$Task$andThen,
			taskFunc,
			function (func) {
				return A2(
					_elm_lang$core$Task$andThen,
					taskValue,
					function (value) {
						return _elm_lang$core$Task$succeed(
							func(value));
					});
			});
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p2 = tasks;
	if (_p2.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			_elm_lang$core$Native_List.fromArray(
				[]));
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return A2(_elm_lang$core$List_ops['::'], x, y);
				}),
			_p2._0,
			_elm_lang$core$Task$sequence(_p2._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p3) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$toMaybe = function (task) {
	return A2(
		_elm_lang$core$Task$onError,
		A2(_elm_lang$core$Task$map, _elm_lang$core$Maybe$Just, task),
		function (_p4) {
			return _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
		});
};
var _elm_lang$core$Task$fromMaybe = F2(
	function ($default, maybe) {
		var _p5 = maybe;
		if (_p5.ctor === 'Just') {
			return _elm_lang$core$Task$succeed(_p5._0);
		} else {
			return _elm_lang$core$Task$fail($default);
		}
	});
var _elm_lang$core$Task$toResult = function (task) {
	return A2(
		_elm_lang$core$Task$onError,
		A2(_elm_lang$core$Task$map, _elm_lang$core$Result$Ok, task),
		function (msg) {
			return _elm_lang$core$Task$succeed(
				_elm_lang$core$Result$Err(msg));
		});
};
var _elm_lang$core$Task$fromResult = function (result) {
	var _p6 = result;
	if (_p6.ctor === 'Ok') {
		return _elm_lang$core$Task$succeed(_p6._0);
	} else {
		return _elm_lang$core$Task$fail(_p6._0);
	}
};
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p9, _p8, _p7) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$T = function (a) {
	return {ctor: 'T', _0: a};
};
var _elm_lang$core$Task$perform = F3(
	function (onFail, onSuccess, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$T(
				A2(
					_elm_lang$core$Task$onError,
					A2(_elm_lang$core$Task$map, onSuccess, task),
					function (x) {
						return _elm_lang$core$Task$succeed(
							onFail(x));
					})));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$T(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;
	
	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}	
	
	return _elm_lang$core$Native_List.fromArray(is);
}

function toInt(s)
{
	var len = s.length;
	if (len === 0)
	{
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
	}
	var start = 0;
	if (s[0] === '-')
	{
		if (len === 1)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
		}
		start = 1;
	}
	for (var i = start; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
		}
	}
	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function toFloat(s)
{
	var len = s.length;
	if (len === 0)
	{
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
	}
	var start = 0;
	if (s[0] === '-')
	{
		if (len === 1)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
		}
		start = 1;
	}
	var dotCount = 0;
	for (var i = start; i < len; ++i)
	{
		var c = s[i];
		if ('0' <= c && c <= '9')
		{
			continue;
		}
		if (c === '.')
		{
			dotCount += 1;
			if (dotCount <= 1)
			{
				continue;
			}
		}
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
	}
	return _elm_lang$core$Result$Ok(parseFloat(s));
}

function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return A2(_elm_lang$core$List_ops['::'], key, keyList);
			}),
		_elm_lang$core$Native_List.fromArray(
			[]),
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return A2(_elm_lang$core$List_ops['::'], value, valueList);
			}),
		_elm_lang$core$Native_List.fromArray(
			[]),
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return A2(
					_elm_lang$core$List_ops['::'],
					{ctor: '_Tuple2', _0: key, _1: value},
					list);
			}),
		_elm_lang$core$Native_List.fromArray(
			[]),
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				_elm_lang$core$Native_List.fromArray(
					[
						'Internal red-black tree invariant violated, expected ',
						msg,
						' and got ',
						_elm_lang$core$Basics$toString(c),
						'/',
						lgot,
						'/',
						rgot,
						'\nPlease report this bug to <https://github.com/elm-lang/core/issues>'
					])));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (c, l, r) {
		var _p29 = {ctor: '_Tuple2', _0: l, _1: r};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = c;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: c, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						c,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: c, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						c,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var l$ = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, c, k, v, l$, r);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	_elm_lang$core$Native_List.fromArray(
		[]));
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function decodeObject(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function decodeTuple(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'tuple',
		func: f,
		decoders: decoders
	};
}

function andThen(decoder, callback)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function customAndThen(decoder, callback)
{
	return {
		ctor: '<decoder>',
		tag: 'customAndThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function decodeObject1(f, d1)
{
	return decodeObject(f, [d1]);
}

function decodeObject2(f, d1, d2)
{
	return decodeObject(f, [d1, d2]);
}

function decodeObject3(f, d1, d2, d3)
{
	return decodeObject(f, [d1, d2, d3]);
}

function decodeObject4(f, d1, d2, d3, d4)
{
	return decodeObject(f, [d1, d2, d3, d4]);
}

function decodeObject5(f, d1, d2, d3, d4, d5)
{
	return decodeObject(f, [d1, d2, d3, d4, d5]);
}

function decodeObject6(f, d1, d2, d3, d4, d5, d6)
{
	return decodeObject(f, [d1, d2, d3, d4, d5, d6]);
}

function decodeObject7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return decodeObject(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function decodeObject8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return decodeObject(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODING TUPLES

function decodeTuple1(f, d1)
{
	return decodeTuple(f, [d1]);
}

function decodeTuple2(f, d1, d2)
{
	return decodeTuple(f, [d1, d2]);
}

function decodeTuple3(f, d1, d2, d3)
{
	return decodeTuple(f, [d1, d2, d3]);
}

function decodeTuple4(f, d1, d2, d3, d4)
{
	return decodeTuple(f, [d1, d2, d3, d4]);
}

function decodeTuple5(f, d1, d2, d3, d4, d5)
{
	return decodeTuple(f, [d1, d2, d3, d4, d5]);
}

function decodeTuple6(f, d1, d2, d3, d4, d5, d6)
{
	return decodeTuple(f, [d1, d2, d3, d4, d5, d6]);
}

function decodeTuple7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return decodeTuple(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function decodeTuple8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return decodeTuple(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function badCustom(msg)
{
	return { tag: 'custom', msg: msg };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'custom':
				return 'A `customDecoder` failed'
					+ (context === '_' ? '' : ' at ' + context)
					+ ' with the message: ' + problem.msg;

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok')
				? result
				: badField(field, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'tuple':
			var decoders = decoder.decoders;
			var len = decoders.length;

			if ( !(value instanceof Array) || value.length !== len )
			{
				return badPrimitive('a Tuple with ' + len + ' entries', value);
			}

			var answer = decoder.func;
			for (var i = 0; i < len; i++)
			{
				var result = runHelp(decoders[i], value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'customAndThen':
			var result = runHelp(decoder.decoder, value);
			if (result.tag !== 'ok')
			{
				return result;
			}
			var realResult = decoder.callback(result.value);
			if (realResult.ctor === 'Err')
			{
				return badCustom(realResult._0);
			}
			return ok(realResult._0);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'map-many':
		case 'tuple':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
		case 'customAndThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),

	decodeObject1: F2(decodeObject1),
	decodeObject2: F3(decodeObject2),
	decodeObject3: F4(decodeObject3),
	decodeObject4: F5(decodeObject4),
	decodeObject5: F6(decodeObject5),
	decodeObject6: F7(decodeObject6),
	decodeObject7: F8(decodeObject7),
	decodeObject8: F9(decodeObject8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	decodeTuple1: F2(decodeTuple1),
	decodeTuple2: F3(decodeTuple2),
	decodeTuple3: F4(decodeTuple3),
	decodeTuple4: F5(decodeTuple4),
	decodeTuple5: F6(decodeTuple5),
	decodeTuple6: F7(decodeTuple6),
	decodeTuple7: F8(decodeTuple7),
	decodeTuple8: F9(decodeTuple8),

	andThen: F2(andThen),
	customAndThen: F2(customAndThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$tuple8 = _elm_lang$core$Native_Json.decodeTuple8;
var _elm_lang$core$Json_Decode$tuple7 = _elm_lang$core$Native_Json.decodeTuple7;
var _elm_lang$core$Json_Decode$tuple6 = _elm_lang$core$Native_Json.decodeTuple6;
var _elm_lang$core$Json_Decode$tuple5 = _elm_lang$core$Native_Json.decodeTuple5;
var _elm_lang$core$Json_Decode$tuple4 = _elm_lang$core$Native_Json.decodeTuple4;
var _elm_lang$core$Json_Decode$tuple3 = _elm_lang$core$Native_Json.decodeTuple3;
var _elm_lang$core$Json_Decode$tuple2 = _elm_lang$core$Native_Json.decodeTuple2;
var _elm_lang$core$Json_Decode$tuple1 = _elm_lang$core$Native_Json.decodeTuple1;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$customDecoder = _elm_lang$core$Native_Json.customAndThen;
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$object8 = _elm_lang$core$Native_Json.decodeObject8;
var _elm_lang$core$Json_Decode$object7 = _elm_lang$core$Native_Json.decodeObject7;
var _elm_lang$core$Json_Decode$object6 = _elm_lang$core$Native_Json.decodeObject6;
var _elm_lang$core$Json_Decode$object5 = _elm_lang$core$Native_Json.decodeObject5;
var _elm_lang$core$Json_Decode$object4 = _elm_lang$core$Native_Json.decodeObject4;
var _elm_lang$core$Json_Decode$object3 = _elm_lang$core$Native_Json.decodeObject3;
var _elm_lang$core$Json_Decode$object2 = _elm_lang$core$Native_Json.decodeObject2;
var _elm_lang$core$Json_Decode$object1 = _elm_lang$core$Native_Json.decodeObject1;
var _elm_lang$core$Json_Decode_ops = _elm_lang$core$Json_Decode_ops || {};
_elm_lang$core$Json_Decode_ops[':='] = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, y) {
					return A2(_elm_lang$core$Json_Decode_ops[':='], x, y);
				}),
			decoder,
			fields);
	});
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.decodeObject1;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

//import Native.Json //

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';



////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (!a.options === b.options)
	{
		if (a.stopPropagation !== b.stopPropagation || a.preventDefault !== b.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}



////////////  RENDERER  ////////////


function renderer(parent, tagger, initialVirtualNode)
{
	var eventNode = { tagger: tagger, parent: undefined };

	var domNode = render(initialVirtualNode, eventNode);
	parent.appendChild(domNode);

	var state = 'NO_REQUEST';
	var currentVirtualNode = initialVirtualNode;
	var nextVirtualNode = initialVirtualNode;

	function registerVirtualNode(vNode)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextVirtualNode = vNode;
	}

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/core/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var patches = diff(currentVirtualNode, nextVirtualNode);
				domNode = applyPatches(domNode, currentVirtualNode, patches, eventNode);
				currentVirtualNode = nextVirtualNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return { update: registerVirtualNode };
}


var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(cb) { setTimeout(cb, 1000 / 60); };



////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = {
				tagger: tagger,
				parent: eventNode
			};

			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return document.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? document.createElementNS(vNode.namespace, vNode.tag)
				: document.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? document.createElementNS(vNode.namespace, vNode.tag)
				: document.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			domNode.elm_event_node_ref.tagger = patch.data;
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = document.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}



////////////  PROGRAMS  ////////////


function programWithFlags(details)
{
	return {
		init: details.init,
		update: details.update,
		subscriptions: details.subscriptions,
		view: details.view,
		renderer: renderer
	};
}


return {
	node: node,
	text: text,

	custom: custom,

	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	programWithFlags: programWithFlags
};

}();
var _elm_lang$virtual_dom$VirtualDom$programWithFlags = _elm_lang$virtual_dom$Native_VirtualDom.programWithFlags;
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main$ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$svg = _elm_lang$html$Html$node('svg');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_App$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html_App$program = function (app) {
	return _elm_lang$html$Html_App$programWithFlags(
		_elm_lang$core$Native_Utils.update(
			app,
			{
				init: function (_p0) {
					return app.init;
				}
			}));
};
var _elm_lang$html$Html_App$beginnerProgram = function (_p1) {
	var _p2 = _p1;
	return _elm_lang$html$Html_App$programWithFlags(
		{
			init: function (_p3) {
				return A2(
					_elm_lang$core$Platform_Cmd_ops['!'],
					_p2.model,
					_elm_lang$core$Native_List.fromArray(
						[]));
			},
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p2.update, msg, model),
						_elm_lang$core$Native_List.fromArray(
							[]));
				}),
			view: _p2.view,
			subscriptions: function (_p4) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html_App$map = _elm_lang$virtual_dom$VirtualDom$map;

/* globals Elm */
/* eslint-disable new-cap, no-underscore-dangle */

/**
 * If it's not a Maybe, returns whatever value that is, if it is
 * a Maybe, returns `value` for `Just value` and `null` for `Nothing`
 * @method fromMaybe
 * @param  {Object<Any> | Any } val
 * @return {Any}
 */
const fromMaybe = val => {
  const isMaybe = val && val.ctor;

  if (!isMaybe) {
    return val;
  }

  return val._0 ? val._0 : null;
};

const parseElmList = l => {
  if (Array.isArray(l)) {
    return l;
  }

  let list = []
  let counter = 0
  let key = `_${counter}`;
  while (l[key] !== undefined && l[key].ctor !== '[]') {
    list = list.concat(l[key]);
    counter = counter + 1
    key = `_${counter}`;
  }

  return list;
}

/**
 * Creates an Elm acceptable Modal object
 * @method Modal
 * @param  {String} selector
 * @param  {String | Maybe String} targetUrl
 */
const Modal = function ({ selector, targetUrl } = {}) {
  if (!selector) {
    // It was not set by Elm
    return null;
  }

  const url = fromMaybe(targetUrl);
  return { selector, targetUrl: url };
};

/**
 * Creates an Elm acceptable HistoryState object
 * This is used to make the link Elm-JS and JS-Elm
 * @method HistoryState
 * @param  {String} url
 * @param  {Array<Modal>}
 */
const HistoryState = function (state) {
  const { url, openModals, sessionId } = state || {};
  if (!url) {
    // It was not set by Elm
    return null;
  }

  const modals = parseElmList(openModals).map(Modal);
  modals.forEach(m => {
    if (!m) {
      throw new Error(
        'A null modal was found in a history state. '
        + `Something is wrong. Here are all the modals ${JSON.stringify(modals)}`
      );
    }
  });
  return { url, sessionId, openModals: modals };
};


// ============================ ELM NATIVE =====================================


const _user$project$Native_History = {
  pushState: (state) => {
    const histState = HistoryState(state);
    window.history.pushState(histState, 'modal-router-state', histState.url)
  },
  replaceState: (state) => {
    const histState = HistoryState(state);
    window.history.replaceState(histState, 'modal-router-state', histState.url)
  },
  getState: () => HistoryState(window.history.state),
};

/* global $*/
var _user$project$Native_Modal = {
  open: (selector) => {
    document.querySelector(selector);
    $(selector).modal('show');
  },
  close: (selector) => {
    document.querySelector(selector);
    $(selector).modal('hide');
  },
  getOpen: () => {
    return ['myId']; // TODO: implement this
  },
};

var _user$project$Modal$getOpen = function (a) {
	return _user$project$Native_Modal.getOpen(
		{ctor: '_Tuple0'});
};
var _user$project$Modal$close = function (modal) {
	return A2(
		_elm_lang$core$Basics$always,
		_elm_lang$core$Platform_Cmd$none,
		_user$project$Native_Modal.close(modal.selector));
};
var _user$project$Modal$open = function (modal) {
	return A2(
		_elm_lang$core$Basics$always,
		_elm_lang$core$Platform_Cmd$none,
		_user$project$Native_Modal.open(modal.selector));
};
var _user$project$Modal$Modal = F2(
	function (a, b) {
		return {selector: a, targetUrl: b};
	});

var _user$project$Native_Uri = {
  encodeUri: encodeURI,
  encodeUriComponent: encodeURIComponent,
  getCurrent: () => window.location.pathname,
};

var _user$project$Uri$getCurrent = function (a) {
	return _user$project$Native_Uri.getCurrent(
		{ctor: '_Tuple0'});
};
var _user$project$Uri$encodeUriComponent = function (str) {
	return _user$project$Native_Uri.encodeUriComponent(str);
};
var _user$project$Uri$encodeUri = function (str) {
	return _user$project$Native_Uri.encodeUri(str);
};

var _user$project$History$getState = function (a) {
	return _user$project$Native_History.getState(a);
};
var _user$project$History$replaceState = function (hist) {
	return A2(
		_elm_lang$core$Basics$always,
		_elm_lang$core$Platform_Cmd$none,
		_user$project$Native_History.replaceState(hist));
};
var _user$project$History$pushState = function (hist) {
	return A2(
		_elm_lang$core$Basics$always,
		_elm_lang$core$Platform_Cmd$none,
		_user$project$Native_History.pushState(
			A2(_elm_lang$core$Debug$log, 'Pushing history: ', hist)));
};
var _user$project$History$HistoryState = F3(
	function (a, b, c) {
		return {openModals: a, url: b, sessionId: c};
	});

var _user$project$ModalRouter_Types$Model = F3(
	function (a, b, c) {
		return {openModals: a, initialUrl: b, sessionId: c};
	});
var _user$project$ModalRouter_Types$ModalClose = function (a) {
	return {ctor: 'ModalClose', _0: a};
};
var _user$project$ModalRouter_Types$ModalOpen = function (a) {
	return {ctor: 'ModalOpen', _0: a};
};
var _user$project$ModalRouter_Types$PopState = function (a) {
	return {ctor: 'PopState', _0: a};
};

var _user$project$ModalRouter_State$toHistoryState = function (_p0) {
	var _p1 = _p0;
	var _p2 = _p1.openModals;
	var stateUrl = A2(
		_elm_lang$core$Maybe$withDefault,
		_p1.initialUrl,
		A3(
			_elm_lang$core$Basics$flip,
			_elm_lang$core$Maybe$andThen,
			function (x) {
				return x.targetUrl;
			},
			_elm_lang$core$List$head(_p2)));
	return A3(_user$project$History$HistoryState, _p2, stateUrl, _p1.sessionId);
};
var _user$project$ModalRouter_State$pushState = function (model) {
	return _user$project$History$pushState(
		_user$project$ModalRouter_State$toHistoryState(model));
};
var _user$project$ModalRouter_State$replaceState = function (model) {
	return _user$project$History$replaceState(
		_user$project$ModalRouter_State$toHistoryState(model));
};
var _user$project$ModalRouter_State$missingIn = F2(
	function (a, b) {
		return A2(
			_elm_lang$core$List$filter,
			function (x) {
				return _elm_lang$core$Basics$not(
					A2(_elm_lang$core$List$member, x, b));
			},
			a);
	});
var _user$project$ModalRouter_State$conformWindowToState = F2(
	function (state, model) {
		var modalsToClose = A2(_user$project$ModalRouter_State$missingIn, model.openModals, state.openModals);
		var modalsToOpen = A2(_user$project$ModalRouter_State$missingIn, state.openModals, model.openModals);
		return _elm_lang$core$Platform_Cmd$batch(
			_elm_lang$core$List$concat(
				_elm_lang$core$Native_List.fromArray(
					[
						A2(_elm_lang$core$List$map, _user$project$Modal$open, modalsToOpen),
						A2(_elm_lang$core$List$map, _user$project$Modal$close, modalsToClose),
						_elm_lang$core$Native_List.fromArray(
						[
							_user$project$History$replaceState(state)
						])
					])));
	});
var _user$project$ModalRouter_State$isModalOpen = F2(
	function (openModals, selector) {
		return A2(
			_elm_lang$core$List$member,
			selector,
			A2(
				_elm_lang$core$List$map,
				function (m) {
					return m.selector;
				},
				openModals));
	});
var _user$project$ModalRouter_State$init = function (sessionId) {
	var currentOpenModals = _elm_lang$core$Native_List.fromArray(
		[]);
	var currentUrl = _user$project$Uri$getCurrent(
		{ctor: '_Tuple0'});
	var initialModel = A3(_user$project$ModalRouter_Types$Model, currentOpenModals, currentUrl, sessionId);
	return {
		ctor: '_Tuple2',
		_0: initialModel,
		_1: _user$project$ModalRouter_State$replaceState(initialModel)
	};
};
var _user$project$ModalRouter_State$onPopState = _elm_lang$core$Native_Platform.incomingPort(
	'onPopState',
	_elm_lang$core$Json_Decode$oneOf(
		_elm_lang$core$Native_List.fromArray(
			[
				_elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
				A2(
				_elm_lang$core$Json_Decode$map,
				_elm_lang$core$Maybe$Just,
				A2(
					_elm_lang$core$Json_Decode$andThen,
					A2(
						_elm_lang$core$Json_Decode_ops[':='],
						'openModals',
						_elm_lang$core$Json_Decode$list(
							A2(
								_elm_lang$core$Json_Decode$andThen,
								A2(_elm_lang$core$Json_Decode_ops[':='], 'selector', _elm_lang$core$Json_Decode$string),
								function (selector) {
									return A2(
										_elm_lang$core$Json_Decode$andThen,
										A2(
											_elm_lang$core$Json_Decode_ops[':='],
											'targetUrl',
											_elm_lang$core$Json_Decode$oneOf(
												_elm_lang$core$Native_List.fromArray(
													[
														_elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
														A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string)
													]))),
										function (targetUrl) {
											return _elm_lang$core$Json_Decode$succeed(
												{selector: selector, targetUrl: targetUrl});
										});
								}))),
					function (openModals) {
						return A2(
							_elm_lang$core$Json_Decode$andThen,
							A2(_elm_lang$core$Json_Decode_ops[':='], 'url', _elm_lang$core$Json_Decode$string),
							function (url) {
								return A2(
									_elm_lang$core$Json_Decode$andThen,
									A2(_elm_lang$core$Json_Decode_ops[':='], 'sessionId', _elm_lang$core$Json_Decode$int),
									function (sessionId) {
										return _elm_lang$core$Json_Decode$succeed(
											{openModals: openModals, url: url, sessionId: sessionId});
									});
							});
					}))
			])));
var _user$project$ModalRouter_State$onModalOpen = _elm_lang$core$Native_Platform.incomingPort(
	'onModalOpen',
	A2(
		_elm_lang$core$Json_Decode$andThen,
		A2(_elm_lang$core$Json_Decode_ops[':='], 'selector', _elm_lang$core$Json_Decode$string),
		function (selector) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				A2(
					_elm_lang$core$Json_Decode_ops[':='],
					'targetUrl',
					_elm_lang$core$Json_Decode$oneOf(
						_elm_lang$core$Native_List.fromArray(
							[
								_elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
								A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string)
							]))),
				function (targetUrl) {
					return _elm_lang$core$Json_Decode$succeed(
						{selector: selector, targetUrl: targetUrl});
				});
		}));
var _user$project$ModalRouter_State$onModalClose = _elm_lang$core$Native_Platform.incomingPort('onModalClose', _elm_lang$core$Json_Decode$string);
var _user$project$ModalRouter_State$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$batch(
		_elm_lang$core$Native_List.fromArray(
			[
				_user$project$ModalRouter_State$onPopState(_user$project$ModalRouter_Types$PopState),
				_user$project$ModalRouter_State$onModalOpen(_user$project$ModalRouter_Types$ModalOpen),
				_user$project$ModalRouter_State$onModalClose(_user$project$ModalRouter_Types$ModalClose)
			]));
};
var _user$project$ModalRouter_State$reload = _elm_lang$core$Native_Platform.outgoingPort(
	'reload',
	function (v) {
		return null;
	});
var _user$project$ModalRouter_State$update = F2(
	function (msg, model) {
		var _p3 = msg;
		switch (_p3.ctor) {
			case 'PopState':
				var _p4 = _p3._0;
				if (_p4.ctor === 'Nothing') {
					return {
						ctor: '_Tuple2',
						_0: model,
						_1: _user$project$ModalRouter_State$replaceState(model)
					};
				} else {
					var _p5 = _p4._0;
					var newModel = _elm_lang$core$Native_Utils.update(
						model,
						{openModals: _p5.openModals});
					return _elm_lang$core$Native_Utils.eq(_p5.sessionId, model.sessionId) ? {
						ctor: '_Tuple2',
						_0: newModel,
						_1: A2(_user$project$ModalRouter_State$conformWindowToState, _p5, model)
					} : {
						ctor: '_Tuple2',
						_0: newModel,
						_1: _elm_lang$core$Platform_Cmd$batch(
							_elm_lang$core$Native_List.fromArray(
								[
									_user$project$History$replaceState(_p5),
									_user$project$ModalRouter_State$reload(
									{ctor: '_Tuple0'})
								]))
					};
				}
			case 'ModalOpen':
				var _p6 = _p3._0;
				var modelPlusModal = _elm_lang$core$Native_Utils.update(
					model,
					{
						openModals: A2(_elm_lang$core$List_ops['::'], _p6, model.openModals)
					});
				var modalRegisteredAsOpen = A2(_user$project$ModalRouter_State$isModalOpen, model.openModals, _p6.selector);
				return modalRegisteredAsOpen ? {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none} : {
					ctor: '_Tuple2',
					_0: modelPlusModal,
					_1: _user$project$ModalRouter_State$pushState(modelPlusModal)
				};
			default:
				var _p7 = _p3._0;
				var listWithoutModal = A2(
					_elm_lang$core$List$filter,
					function (n) {
						return !_elm_lang$core$Native_Utils.eq(n.selector, _p7);
					},
					model.openModals);
				var modelMinusModal = _elm_lang$core$Native_Utils.update(
					model,
					{openModals: listWithoutModal});
				var modalRegisteredAsClosed = _elm_lang$core$Basics$not(
					A2(_user$project$ModalRouter_State$isModalOpen, model.openModals, _p7));
				return modalRegisteredAsClosed ? {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none} : {
					ctor: '_Tuple2',
					_0: modelMinusModal,
					_1: _user$project$ModalRouter_State$pushState(modelMinusModal)
				};
		}
	});

var _user$project$ModalRouter$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		_elm_lang$core$Native_List.fromArray(
			[]),
		_elm_lang$core$Native_List.fromArray(
			[]));
};
var _user$project$ModalRouter$main = {
	main: _elm_lang$html$Html_App$programWithFlags(
		{init: _user$project$ModalRouter_State$init, view: _user$project$ModalRouter$view, update: _user$project$ModalRouter_State$update, subscriptions: _user$project$ModalRouter_State$subscriptions}),
	flags: _elm_lang$core$Json_Decode$int
};

var Elm = {};
Elm['ModalRouter'] = Elm['ModalRouter'] || {};
_elm_lang$core$Native_Platform.addPublicModule(Elm['ModalRouter'], 'ModalRouter', typeof _user$project$ModalRouter$main === 'undefined' ? null : _user$project$ModalRouter$main);

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);


(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

/* globals Elm, $ */
/* eslint-disable new-cap, no-underscore-dangle */

(function () {
  /**
   * If it's not a Maybe, returns whatever value that is, if it is
   * a Maybe, returns `value` for `Just value` and `null` for `Nothing`
   * @method fromMaybe
   * @param  {Object<Any> | Any } val
   * @return {Any}
   */
  var fromMaybe = function fromMaybe(val) {
    var isMaybe = val && val.ctor;

    if (!isMaybe) {
      return val;
    }

    return val._0 ? val._0 : null;
  };

  var parseElmList = function parseElmList(l) {
    if (Array.isArray(l)) {
      return l;
    }

    var list = [];
    var counter = 0;
    var key = '_' + counter;
    while (l[key] !== undefined && l[key].ctor !== '[]') {
      list = list.concat(l[key]);
      counter = counter + 1;
      key = '_' + counter;
    }

    return list;
  };

  /**
   * Creates an Elm acceptable Modal object
   * @method Modal
   * @param  {String} selector
   * @param  {String | Maybe String} targetUrl
   */
  var Modal = function Modal() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var selector = _ref.selector;
    var targetUrl = _ref.targetUrl;

    if (!selector) {
      // It was not set by Elm
      return null;
    }

    var url = fromMaybe(targetUrl);
    return { selector: selector, targetUrl: url };
  };

  /**
   * Creates an Elm acceptable HistoryState object
   * This is used to make the link Elm-JS and JS-Elm
   * @method HistoryState
   * @param  {String} url
   * @param  {Array<Modal>}
   */
  var HistoryState = function HistoryState(state) {
    var _ref2 = state || {};

    var url = _ref2.url;
    var openModals = _ref2.openModals;
    var sessionId = _ref2.sessionId;

    if (!url) {
      // It was not set by Elm
      return null;
    }

    var modals = parseElmList(openModals).map(Modal);
    modals.forEach(function (m) {
      if (!m) {
        throw new Error('A null modal was found in a history state. ' + ('Something is wrong. Here are all the modals ' + JSON.stringify(modals)));
      }
    });
    return { url: url, sessionId: sessionId, openModals: modals };
  };

  // =============================================================================

  // We will provide a unique id for our app
  var sessionId = Date.now();
  var app = Elm.ModalRouter.fullscreen(sessionId);

  // We send stuff to Elm with suggestions
  var _app$ports = app.ports;
  var onPopState = _app$ports.onPopState;
  var onModalOpen = _app$ports.onModalOpen;
  var onModalClose = _app$ports.onModalClose;


  window.addEventListener('popstate', function (e) {
    var histState = HistoryState(e.state);
    onPopState.send(histState);
  });

  function getModalInfo(e) {
    var targetUrl = e.relatedTarget && e.relatedTarget.getAttribute('href') ? e.relatedTarget.getAttribute('href') : null;

    var selector = '#' + e.target.id;
    var modalInfo = Modal({ selector: selector, targetUrl: targetUrl });
    return modalInfo;
  }

  $(document.body).on('show.bs.modal', function (e) {
    return onModalOpen.send(getModalInfo(e));
  }).on('hide.bs.modal', function (e) {
    var modal = getModalInfo(e);
    if (!modal) {
      throw new Error('Modal close event did not contain a modal. Something is wrong.');
    }
    onModalClose.send(modal.selector);
  });

  app.ports.reload.subscribe(function () {
    window.location.reload();
  });
})();

})));

//# sourceMappingURL=ports.js.map

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LWVsbS5qcyIsInBvcnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6OFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJmbC1tb2RhbC1yb3V0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbihmdW5jdGlvbigpIHtcbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gRjIoZnVuKVxue1xuICBmdW5jdGlvbiB3cmFwcGVyKGEpIHsgcmV0dXJuIGZ1bmN0aW9uKGIpIHsgcmV0dXJuIGZ1bihhLGIpOyB9OyB9XG4gIHdyYXBwZXIuYXJpdHkgPSAyO1xuICB3cmFwcGVyLmZ1bmMgPSBmdW47XG4gIHJldHVybiB3cmFwcGVyO1xufVxuXG5mdW5jdGlvbiBGMyhmdW4pXG57XG4gIGZ1bmN0aW9uIHdyYXBwZXIoYSkge1xuICAgIHJldHVybiBmdW5jdGlvbihiKSB7IHJldHVybiBmdW5jdGlvbihjKSB7IHJldHVybiBmdW4oYSwgYiwgYyk7IH07IH07XG4gIH1cbiAgd3JhcHBlci5hcml0eSA9IDM7XG4gIHdyYXBwZXIuZnVuYyA9IGZ1bjtcbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmZ1bmN0aW9uIEY0KGZ1bilcbntcbiAgZnVuY3Rpb24gd3JhcHBlcihhKSB7IHJldHVybiBmdW5jdGlvbihiKSB7IHJldHVybiBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGZ1bihhLCBiLCBjLCBkKTsgfTsgfTsgfTtcbiAgfVxuICB3cmFwcGVyLmFyaXR5ID0gNDtcbiAgd3JhcHBlci5mdW5jID0gZnVuO1xuICByZXR1cm4gd3JhcHBlcjtcbn1cblxuZnVuY3Rpb24gRjUoZnVuKVxue1xuICBmdW5jdGlvbiB3cmFwcGVyKGEpIHsgcmV0dXJuIGZ1bmN0aW9uKGIpIHsgcmV0dXJuIGZ1bmN0aW9uKGMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZCkgeyByZXR1cm4gZnVuY3Rpb24oZSkgeyByZXR1cm4gZnVuKGEsIGIsIGMsIGQsIGUpOyB9OyB9OyB9OyB9O1xuICB9XG4gIHdyYXBwZXIuYXJpdHkgPSA1O1xuICB3cmFwcGVyLmZ1bmMgPSBmdW47XG4gIHJldHVybiB3cmFwcGVyO1xufVxuXG5mdW5jdGlvbiBGNihmdW4pXG57XG4gIGZ1bmN0aW9uIHdyYXBwZXIoYSkgeyByZXR1cm4gZnVuY3Rpb24oYikgeyByZXR1cm4gZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBmdW5jdGlvbihkKSB7IHJldHVybiBmdW5jdGlvbihlKSB7IHJldHVybiBmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIGZ1bihhLCBiLCBjLCBkLCBlLCBmKTsgfTsgfTsgfTsgfTsgfTtcbiAgfVxuICB3cmFwcGVyLmFyaXR5ID0gNjtcbiAgd3JhcHBlci5mdW5jID0gZnVuO1xuICByZXR1cm4gd3JhcHBlcjtcbn1cblxuZnVuY3Rpb24gRjcoZnVuKVxue1xuICBmdW5jdGlvbiB3cmFwcGVyKGEpIHsgcmV0dXJuIGZ1bmN0aW9uKGIpIHsgcmV0dXJuIGZ1bmN0aW9uKGMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZCkgeyByZXR1cm4gZnVuY3Rpb24oZSkgeyByZXR1cm4gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiBmdW5jdGlvbihnKSB7IHJldHVybiBmdW4oYSwgYiwgYywgZCwgZSwgZiwgZyk7IH07IH07IH07IH07IH07IH07XG4gIH1cbiAgd3JhcHBlci5hcml0eSA9IDc7XG4gIHdyYXBwZXIuZnVuYyA9IGZ1bjtcbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmZ1bmN0aW9uIEY4KGZ1bilcbntcbiAgZnVuY3Rpb24gd3JhcHBlcihhKSB7IHJldHVybiBmdW5jdGlvbihiKSB7IHJldHVybiBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZykgeyByZXR1cm4gZnVuY3Rpb24oaCkge1xuICAgIHJldHVybiBmdW4oYSwgYiwgYywgZCwgZSwgZiwgZywgaCk7IH07IH07IH07IH07IH07IH07IH07XG4gIH1cbiAgd3JhcHBlci5hcml0eSA9IDg7XG4gIHdyYXBwZXIuZnVuYyA9IGZ1bjtcbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmZ1bmN0aW9uIEY5KGZ1bilcbntcbiAgZnVuY3Rpb24gd3JhcHBlcihhKSB7IHJldHVybiBmdW5jdGlvbihiKSB7IHJldHVybiBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZykgeyByZXR1cm4gZnVuY3Rpb24oaCkgeyByZXR1cm4gZnVuY3Rpb24oaSkge1xuICAgIHJldHVybiBmdW4oYSwgYiwgYywgZCwgZSwgZiwgZywgaCwgaSk7IH07IH07IH07IH07IH07IH07IH07IH07XG4gIH1cbiAgd3JhcHBlci5hcml0eSA9IDk7XG4gIHdyYXBwZXIuZnVuYyA9IGZ1bjtcbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmZ1bmN0aW9uIEEyKGZ1biwgYSwgYilcbntcbiAgcmV0dXJuIGZ1bi5hcml0eSA9PT0gMlxuICAgID8gZnVuLmZ1bmMoYSwgYilcbiAgICA6IGZ1bihhKShiKTtcbn1cbmZ1bmN0aW9uIEEzKGZ1biwgYSwgYiwgYylcbntcbiAgcmV0dXJuIGZ1bi5hcml0eSA9PT0gM1xuICAgID8gZnVuLmZ1bmMoYSwgYiwgYylcbiAgICA6IGZ1bihhKShiKShjKTtcbn1cbmZ1bmN0aW9uIEE0KGZ1biwgYSwgYiwgYywgZClcbntcbiAgcmV0dXJuIGZ1bi5hcml0eSA9PT0gNFxuICAgID8gZnVuLmZ1bmMoYSwgYiwgYywgZClcbiAgICA6IGZ1bihhKShiKShjKShkKTtcbn1cbmZ1bmN0aW9uIEE1KGZ1biwgYSwgYiwgYywgZCwgZSlcbntcbiAgcmV0dXJuIGZ1bi5hcml0eSA9PT0gNVxuICAgID8gZnVuLmZ1bmMoYSwgYiwgYywgZCwgZSlcbiAgICA6IGZ1bihhKShiKShjKShkKShlKTtcbn1cbmZ1bmN0aW9uIEE2KGZ1biwgYSwgYiwgYywgZCwgZSwgZilcbntcbiAgcmV0dXJuIGZ1bi5hcml0eSA9PT0gNlxuICAgID8gZnVuLmZ1bmMoYSwgYiwgYywgZCwgZSwgZilcbiAgICA6IGZ1bihhKShiKShjKShkKShlKShmKTtcbn1cbmZ1bmN0aW9uIEE3KGZ1biwgYSwgYiwgYywgZCwgZSwgZiwgZylcbntcbiAgcmV0dXJuIGZ1bi5hcml0eSA9PT0gN1xuICAgID8gZnVuLmZ1bmMoYSwgYiwgYywgZCwgZSwgZiwgZylcbiAgICA6IGZ1bihhKShiKShjKShkKShlKShmKShnKTtcbn1cbmZ1bmN0aW9uIEE4KGZ1biwgYSwgYiwgYywgZCwgZSwgZiwgZywgaClcbntcbiAgcmV0dXJuIGZ1bi5hcml0eSA9PT0gOFxuICAgID8gZnVuLmZ1bmMoYSwgYiwgYywgZCwgZSwgZiwgZywgaClcbiAgICA6IGZ1bihhKShiKShjKShkKShlKShmKShnKShoKTtcbn1cbmZ1bmN0aW9uIEE5KGZ1biwgYSwgYiwgYywgZCwgZSwgZiwgZywgaCwgaSlcbntcbiAgcmV0dXJuIGZ1bi5hcml0eSA9PT0gOVxuICAgID8gZnVuLmZ1bmMoYSwgYiwgYywgZCwgZSwgZiwgZywgaCwgaSlcbiAgICA6IGZ1bihhKShiKShjKShkKShlKShmKShnKShoKShpKTtcbn1cblxuLy9pbXBvcnQgTmF0aXZlLkxpc3QgLy9cblxudmFyIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheSA9IGZ1bmN0aW9uKCkge1xuXG4vLyBBIFJSQi1UcmVlIGhhcyB0d28gZGlzdGluY3QgZGF0YSB0eXBlcy5cbi8vIExlYWYgLT4gXCJoZWlnaHRcIiAgaXMgYWx3YXlzIDBcbi8vICAgICAgICAgXCJ0YWJsZVwiICAgaXMgYW4gYXJyYXkgb2YgZWxlbWVudHNcbi8vIE5vZGUgLT4gXCJoZWlnaHRcIiAgaXMgYWx3YXlzIGdyZWF0ZXIgdGhhbiAwXG4vLyAgICAgICAgIFwidGFibGVcIiAgIGlzIGFuIGFycmF5IG9mIGNoaWxkIG5vZGVzXG4vLyAgICAgICAgIFwibGVuZ3Roc1wiIGlzIGFuIGFycmF5IG9mIGFjY3VtdWxhdGVkIGxlbmd0aHMgb2YgdGhlIGNoaWxkIG5vZGVzXG5cbi8vIE0gaXMgdGhlIG1heGltYWwgdGFibGUgc2l6ZS4gMzIgc2VlbXMgZmFzdC4gRSBpcyB0aGUgYWxsb3dlZCBpbmNyZWFzZVxuLy8gb2Ygc2VhcmNoIHN0ZXBzIHdoZW4gY29uY2F0dGluZyB0byBmaW5kIGFuIGluZGV4LiBMb3dlciB2YWx1ZXMgd2lsbFxuLy8gZGVjcmVhc2UgYmFsYW5jaW5nLCBidXQgd2lsbCBpbmNyZWFzZSBzZWFyY2ggc3RlcHMuXG52YXIgTSA9IDMyO1xudmFyIEUgPSAyO1xuXG4vLyBBbiBlbXB0eSBhcnJheS5cbnZhciBlbXB0eSA9IHtcblx0Y3RvcjogJ19BcnJheScsXG5cdGhlaWdodDogMCxcblx0dGFibGU6IFtdXG59O1xuXG5cbmZ1bmN0aW9uIGdldChpLCBhcnJheSlcbntcblx0aWYgKGkgPCAwIHx8IGkgPj0gbGVuZ3RoKGFycmF5KSlcblx0e1xuXHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdCdJbmRleCAnICsgaSArICcgaXMgb3V0IG9mIHJhbmdlLiBDaGVjayB0aGUgbGVuZ3RoIG9mICcgK1xuXHRcdFx0J3lvdXIgYXJyYXkgZmlyc3Qgb3IgdXNlIGdldE1heWJlIG9yIGdldFdpdGhEZWZhdWx0LicpO1xuXHR9XG5cdHJldHVybiB1bnNhZmVHZXQoaSwgYXJyYXkpO1xufVxuXG5cbmZ1bmN0aW9uIHVuc2FmZUdldChpLCBhcnJheSlcbntcblx0Zm9yICh2YXIgeCA9IGFycmF5LmhlaWdodDsgeCA+IDA7IHgtLSlcblx0e1xuXHRcdHZhciBzbG90ID0gaSA+PiAoeCAqIDUpO1xuXHRcdHdoaWxlIChhcnJheS5sZW5ndGhzW3Nsb3RdIDw9IGkpXG5cdFx0e1xuXHRcdFx0c2xvdCsrO1xuXHRcdH1cblx0XHRpZiAoc2xvdCA+IDApXG5cdFx0e1xuXHRcdFx0aSAtPSBhcnJheS5sZW5ndGhzW3Nsb3QgLSAxXTtcblx0XHR9XG5cdFx0YXJyYXkgPSBhcnJheS50YWJsZVtzbG90XTtcblx0fVxuXHRyZXR1cm4gYXJyYXkudGFibGVbaV07XG59XG5cblxuLy8gU2V0cyB0aGUgdmFsdWUgYXQgdGhlIGluZGV4IGkuIE9ubHkgdGhlIG5vZGVzIGxlYWRpbmcgdG8gaSB3aWxsIGdldFxuLy8gY29waWVkIGFuZCB1cGRhdGVkLlxuZnVuY3Rpb24gc2V0KGksIGl0ZW0sIGFycmF5KVxue1xuXHRpZiAoaSA8IDAgfHwgbGVuZ3RoKGFycmF5KSA8PSBpKVxuXHR7XG5cdFx0cmV0dXJuIGFycmF5O1xuXHR9XG5cdHJldHVybiB1bnNhZmVTZXQoaSwgaXRlbSwgYXJyYXkpO1xufVxuXG5cbmZ1bmN0aW9uIHVuc2FmZVNldChpLCBpdGVtLCBhcnJheSlcbntcblx0YXJyYXkgPSBub2RlQ29weShhcnJheSk7XG5cblx0aWYgKGFycmF5LmhlaWdodCA9PT0gMClcblx0e1xuXHRcdGFycmF5LnRhYmxlW2ldID0gaXRlbTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHR2YXIgc2xvdCA9IGdldFNsb3QoaSwgYXJyYXkpO1xuXHRcdGlmIChzbG90ID4gMClcblx0XHR7XG5cdFx0XHRpIC09IGFycmF5Lmxlbmd0aHNbc2xvdCAtIDFdO1xuXHRcdH1cblx0XHRhcnJheS50YWJsZVtzbG90XSA9IHVuc2FmZVNldChpLCBpdGVtLCBhcnJheS50YWJsZVtzbG90XSk7XG5cdH1cblx0cmV0dXJuIGFycmF5O1xufVxuXG5cbmZ1bmN0aW9uIGluaXRpYWxpemUobGVuLCBmKVxue1xuXHRpZiAobGVuIDw9IDApXG5cdHtcblx0XHRyZXR1cm4gZW1wdHk7XG5cdH1cblx0dmFyIGggPSBNYXRoLmZsb29yKCBNYXRoLmxvZyhsZW4pIC8gTWF0aC5sb2coTSkgKTtcblx0cmV0dXJuIGluaXRpYWxpemVfKGYsIGgsIDAsIGxlbik7XG59XG5cbmZ1bmN0aW9uIGluaXRpYWxpemVfKGYsIGgsIGZyb20sIHRvKVxue1xuXHRpZiAoaCA9PT0gMClcblx0e1xuXHRcdHZhciB0YWJsZSA9IG5ldyBBcnJheSgodG8gLSBmcm9tKSAlIChNICsgMSkpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGFibGUubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdCAgdGFibGVbaV0gPSBmKGZyb20gKyBpKTtcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdFx0aGVpZ2h0OiAwLFxuXHRcdFx0dGFibGU6IHRhYmxlXG5cdFx0fTtcblx0fVxuXG5cdHZhciBzdGVwID0gTWF0aC5wb3coTSwgaCk7XG5cdHZhciB0YWJsZSA9IG5ldyBBcnJheShNYXRoLmNlaWwoKHRvIC0gZnJvbSkgLyBzdGVwKSk7XG5cdHZhciBsZW5ndGhzID0gbmV3IEFycmF5KHRhYmxlLmxlbmd0aCk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGFibGUubGVuZ3RoOyBpKyspXG5cdHtcblx0XHR0YWJsZVtpXSA9IGluaXRpYWxpemVfKGYsIGggLSAxLCBmcm9tICsgKGkgKiBzdGVwKSwgTWF0aC5taW4oZnJvbSArICgoaSArIDEpICogc3RlcCksIHRvKSk7XG5cdFx0bGVuZ3Roc1tpXSA9IGxlbmd0aCh0YWJsZVtpXSkgKyAoaSA+IDAgPyBsZW5ndGhzW2ktMV0gOiAwKTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdGhlaWdodDogaCxcblx0XHR0YWJsZTogdGFibGUsXG5cdFx0bGVuZ3RoczogbGVuZ3Roc1xuXHR9O1xufVxuXG5mdW5jdGlvbiBmcm9tTGlzdChsaXN0KVxue1xuXHRpZiAobGlzdC5jdG9yID09PSAnW10nKVxuXHR7XG5cdFx0cmV0dXJuIGVtcHR5O1xuXHR9XG5cblx0Ly8gQWxsb2NhdGUgTSBzaXplZCBibG9ja3MgKHRhYmxlKSBhbmQgd3JpdGUgbGlzdCBlbGVtZW50cyB0byBpdC5cblx0dmFyIHRhYmxlID0gbmV3IEFycmF5KE0pO1xuXHR2YXIgbm9kZXMgPSBbXTtcblx0dmFyIGkgPSAwO1xuXG5cdHdoaWxlIChsaXN0LmN0b3IgIT09ICdbXScpXG5cdHtcblx0XHR0YWJsZVtpXSA9IGxpc3QuXzA7XG5cdFx0bGlzdCA9IGxpc3QuXzE7XG5cdFx0aSsrO1xuXG5cdFx0Ly8gdGFibGUgaXMgZnVsbCwgc28gd2UgY2FuIHB1c2ggYSBsZWFmIGNvbnRhaW5pbmcgaXQgaW50byB0aGVcblx0XHQvLyBuZXh0IG5vZGUuXG5cdFx0aWYgKGkgPT09IE0pXG5cdFx0e1xuXHRcdFx0dmFyIGxlYWYgPSB7XG5cdFx0XHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdFx0XHRoZWlnaHQ6IDAsXG5cdFx0XHRcdHRhYmxlOiB0YWJsZVxuXHRcdFx0fTtcblx0XHRcdGZyb21MaXN0UHVzaChsZWFmLCBub2Rlcyk7XG5cdFx0XHR0YWJsZSA9IG5ldyBBcnJheShNKTtcblx0XHRcdGkgPSAwO1xuXHRcdH1cblx0fVxuXG5cdC8vIE1heWJlIHRoZXJlIGlzIHNvbWV0aGluZyBsZWZ0IG9uIHRoZSB0YWJsZS5cblx0aWYgKGkgPiAwKVxuXHR7XG5cdFx0dmFyIGxlYWYgPSB7XG5cdFx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRcdGhlaWdodDogMCxcblx0XHRcdHRhYmxlOiB0YWJsZS5zcGxpY2UoMCwgaSlcblx0XHR9O1xuXHRcdGZyb21MaXN0UHVzaChsZWFmLCBub2Rlcyk7XG5cdH1cblxuXHQvLyBHbyB0aHJvdWdoIGFsbCBvZiB0aGUgbm9kZXMgYW5kIGV2ZW50dWFsbHkgcHVzaCB0aGVtIGludG8gaGlnaGVyIG5vZGVzLlxuXHRmb3IgKHZhciBoID0gMDsgaCA8IG5vZGVzLmxlbmd0aCAtIDE7IGgrKylcblx0e1xuXHRcdGlmIChub2Rlc1toXS50YWJsZS5sZW5ndGggPiAwKVxuXHRcdHtcblx0XHRcdGZyb21MaXN0UHVzaChub2Rlc1toXSwgbm9kZXMpO1xuXHRcdH1cblx0fVxuXG5cdHZhciBoZWFkID0gbm9kZXNbbm9kZXMubGVuZ3RoIC0gMV07XG5cdGlmIChoZWFkLmhlaWdodCA+IDAgJiYgaGVhZC50YWJsZS5sZW5ndGggPT09IDEpXG5cdHtcblx0XHRyZXR1cm4gaGVhZC50YWJsZVswXTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRyZXR1cm4gaGVhZDtcblx0fVxufVxuXG4vLyBQdXNoIGEgbm9kZSBpbnRvIGEgaGlnaGVyIG5vZGUgYXMgYSBjaGlsZC5cbmZ1bmN0aW9uIGZyb21MaXN0UHVzaCh0b1B1c2gsIG5vZGVzKVxue1xuXHR2YXIgaCA9IHRvUHVzaC5oZWlnaHQ7XG5cblx0Ly8gTWF5YmUgdGhlIG5vZGUgb24gdGhpcyBoZWlnaHQgZG9lcyBub3QgZXhpc3QuXG5cdGlmIChub2Rlcy5sZW5ndGggPT09IGgpXG5cdHtcblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdFx0aGVpZ2h0OiBoICsgMSxcblx0XHRcdHRhYmxlOiBbXSxcblx0XHRcdGxlbmd0aHM6IFtdXG5cdFx0fTtcblx0XHRub2Rlcy5wdXNoKG5vZGUpO1xuXHR9XG5cblx0bm9kZXNbaF0udGFibGUucHVzaCh0b1B1c2gpO1xuXHR2YXIgbGVuID0gbGVuZ3RoKHRvUHVzaCk7XG5cdGlmIChub2Rlc1toXS5sZW5ndGhzLmxlbmd0aCA+IDApXG5cdHtcblx0XHRsZW4gKz0gbm9kZXNbaF0ubGVuZ3Roc1tub2Rlc1toXS5sZW5ndGhzLmxlbmd0aCAtIDFdO1xuXHR9XG5cdG5vZGVzW2hdLmxlbmd0aHMucHVzaChsZW4pO1xuXG5cdGlmIChub2Rlc1toXS50YWJsZS5sZW5ndGggPT09IE0pXG5cdHtcblx0XHRmcm9tTGlzdFB1c2gobm9kZXNbaF0sIG5vZGVzKTtcblx0XHRub2Rlc1toXSA9IHtcblx0XHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdFx0aGVpZ2h0OiBoICsgMSxcblx0XHRcdHRhYmxlOiBbXSxcblx0XHRcdGxlbmd0aHM6IFtdXG5cdFx0fTtcblx0fVxufVxuXG4vLyBQdXNoZXMgYW4gaXRlbSB2aWEgcHVzaF8gdG8gdGhlIGJvdHRvbSByaWdodCBvZiBhIHRyZWUuXG5mdW5jdGlvbiBwdXNoKGl0ZW0sIGEpXG57XG5cdHZhciBwdXNoZWQgPSBwdXNoXyhpdGVtLCBhKTtcblx0aWYgKHB1c2hlZCAhPT0gbnVsbClcblx0e1xuXHRcdHJldHVybiBwdXNoZWQ7XG5cdH1cblxuXHR2YXIgbmV3VHJlZSA9IGNyZWF0ZShpdGVtLCBhLmhlaWdodCk7XG5cdHJldHVybiBzaWJsaXNlKGEsIG5ld1RyZWUpO1xufVxuXG4vLyBSZWN1cnNpdmVseSB0cmllcyB0byBwdXNoIGFuIGl0ZW0gdG8gdGhlIGJvdHRvbS1yaWdodCBtb3N0XG4vLyB0cmVlIHBvc3NpYmxlLiBJZiB0aGVyZSBpcyBubyBzcGFjZSBsZWZ0IGZvciB0aGUgaXRlbSxcbi8vIG51bGwgd2lsbCBiZSByZXR1cm5lZC5cbmZ1bmN0aW9uIHB1c2hfKGl0ZW0sIGEpXG57XG5cdC8vIEhhbmRsZSByZXN1cnNpb24gc3RvcCBhdCBsZWFmIGxldmVsLlxuXHRpZiAoYS5oZWlnaHQgPT09IDApXG5cdHtcblx0XHRpZiAoYS50YWJsZS5sZW5ndGggPCBNKVxuXHRcdHtcblx0XHRcdHZhciBuZXdBID0ge1xuXHRcdFx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRcdFx0aGVpZ2h0OiAwLFxuXHRcdFx0XHR0YWJsZTogYS50YWJsZS5zbGljZSgpXG5cdFx0XHR9O1xuXHRcdFx0bmV3QS50YWJsZS5wdXNoKGl0ZW0pO1xuXHRcdFx0cmV0dXJuIG5ld0E7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0ICByZXR1cm4gbnVsbDtcblx0XHR9XG5cdH1cblxuXHQvLyBSZWN1cnNpdmVseSBwdXNoXG5cdHZhciBwdXNoZWQgPSBwdXNoXyhpdGVtLCBib3RSaWdodChhKSk7XG5cblx0Ly8gVGhlcmUgd2FzIHNwYWNlIGluIHRoZSBib3R0b20gcmlnaHQgdHJlZSwgc28gdGhlIHNsb3Qgd2lsbFxuXHQvLyBiZSB1cGRhdGVkLlxuXHRpZiAocHVzaGVkICE9PSBudWxsKVxuXHR7XG5cdFx0dmFyIG5ld0EgPSBub2RlQ29weShhKTtcblx0XHRuZXdBLnRhYmxlW25ld0EudGFibGUubGVuZ3RoIC0gMV0gPSBwdXNoZWQ7XG5cdFx0bmV3QS5sZW5ndGhzW25ld0EubGVuZ3Rocy5sZW5ndGggLSAxXSsrO1xuXHRcdHJldHVybiBuZXdBO1xuXHR9XG5cblx0Ly8gV2hlbiB0aGVyZSB3YXMgbm8gc3BhY2UgbGVmdCwgY2hlY2sgaWYgdGhlcmUgaXMgc3BhY2UgbGVmdFxuXHQvLyBmb3IgYSBuZXcgc2xvdCB3aXRoIGEgdHJlZSB3aGljaCBjb250YWlucyBvbmx5IHRoZSBpdGVtXG5cdC8vIGF0IHRoZSBib3R0b20uXG5cdGlmIChhLnRhYmxlLmxlbmd0aCA8IE0pXG5cdHtcblx0XHR2YXIgbmV3U2xvdCA9IGNyZWF0ZShpdGVtLCBhLmhlaWdodCAtIDEpO1xuXHRcdHZhciBuZXdBID0gbm9kZUNvcHkoYSk7XG5cdFx0bmV3QS50YWJsZS5wdXNoKG5ld1Nsb3QpO1xuXHRcdG5ld0EubGVuZ3Rocy5wdXNoKG5ld0EubGVuZ3Roc1tuZXdBLmxlbmd0aHMubGVuZ3RoIC0gMV0gKyBsZW5ndGgobmV3U2xvdCkpO1xuXHRcdHJldHVybiBuZXdBO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG59XG5cbi8vIENvbnZlcnRzIGFuIGFycmF5IGludG8gYSBsaXN0IG9mIGVsZW1lbnRzLlxuZnVuY3Rpb24gdG9MaXN0KGEpXG57XG5cdHJldHVybiB0b0xpc3RfKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0Lk5pbCwgYSk7XG59XG5cbmZ1bmN0aW9uIHRvTGlzdF8obGlzdCwgYSlcbntcblx0Zm9yICh2YXIgaSA9IGEudGFibGUubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pXG5cdHtcblx0XHRsaXN0ID1cblx0XHRcdGEuaGVpZ2h0ID09PSAwXG5cdFx0XHRcdD8gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuQ29ucyhhLnRhYmxlW2ldLCBsaXN0KVxuXHRcdFx0XHQ6IHRvTGlzdF8obGlzdCwgYS50YWJsZVtpXSk7XG5cdH1cblx0cmV0dXJuIGxpc3Q7XG59XG5cbi8vIE1hcHMgYSBmdW5jdGlvbiBvdmVyIHRoZSBlbGVtZW50cyBvZiBhbiBhcnJheS5cbmZ1bmN0aW9uIG1hcChmLCBhKVxue1xuXHR2YXIgbmV3QSA9IHtcblx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRoZWlnaHQ6IGEuaGVpZ2h0LFxuXHRcdHRhYmxlOiBuZXcgQXJyYXkoYS50YWJsZS5sZW5ndGgpXG5cdH07XG5cdGlmIChhLmhlaWdodCA+IDApXG5cdHtcblx0XHRuZXdBLmxlbmd0aHMgPSBhLmxlbmd0aHM7XG5cdH1cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhLnRhYmxlLmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0bmV3QS50YWJsZVtpXSA9XG5cdFx0XHRhLmhlaWdodCA9PT0gMFxuXHRcdFx0XHQ/IGYoYS50YWJsZVtpXSlcblx0XHRcdFx0OiBtYXAoZiwgYS50YWJsZVtpXSk7XG5cdH1cblx0cmV0dXJuIG5ld0E7XG59XG5cbi8vIE1hcHMgYSBmdW5jdGlvbiBvdmVyIHRoZSBlbGVtZW50cyB3aXRoIHRoZWlyIGluZGV4IGFzIGZpcnN0IGFyZ3VtZW50LlxuZnVuY3Rpb24gaW5kZXhlZE1hcChmLCBhKVxue1xuXHRyZXR1cm4gaW5kZXhlZE1hcF8oZiwgYSwgMCk7XG59XG5cbmZ1bmN0aW9uIGluZGV4ZWRNYXBfKGYsIGEsIGZyb20pXG57XG5cdHZhciBuZXdBID0ge1xuXHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdGhlaWdodDogYS5oZWlnaHQsXG5cdFx0dGFibGU6IG5ldyBBcnJheShhLnRhYmxlLmxlbmd0aClcblx0fTtcblx0aWYgKGEuaGVpZ2h0ID4gMClcblx0e1xuXHRcdG5ld0EubGVuZ3RocyA9IGEubGVuZ3Rocztcblx0fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGEudGFibGUubGVuZ3RoOyBpKyspXG5cdHtcblx0XHRuZXdBLnRhYmxlW2ldID1cblx0XHRcdGEuaGVpZ2h0ID09PSAwXG5cdFx0XHRcdD8gQTIoZiwgZnJvbSArIGksIGEudGFibGVbaV0pXG5cdFx0XHRcdDogaW5kZXhlZE1hcF8oZiwgYS50YWJsZVtpXSwgaSA9PSAwID8gZnJvbSA6IGZyb20gKyBhLmxlbmd0aHNbaSAtIDFdKTtcblx0fVxuXHRyZXR1cm4gbmV3QTtcbn1cblxuZnVuY3Rpb24gZm9sZGwoZiwgYiwgYSlcbntcblx0aWYgKGEuaGVpZ2h0ID09PSAwKVxuXHR7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhLnRhYmxlLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGIgPSBBMihmLCBhLnRhYmxlW2ldLCBiKTtcblx0XHR9XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhLnRhYmxlLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGIgPSBmb2xkbChmLCBiLCBhLnRhYmxlW2ldKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGI7XG59XG5cbmZ1bmN0aW9uIGZvbGRyKGYsIGIsIGEpXG57XG5cdGlmIChhLmhlaWdodCA9PT0gMClcblx0e1xuXHRcdGZvciAodmFyIGkgPSBhLnRhYmxlLmxlbmd0aDsgaS0tOyApXG5cdFx0e1xuXHRcdFx0YiA9IEEyKGYsIGEudGFibGVbaV0sIGIpO1xuXHRcdH1cblx0fVxuXHRlbHNlXG5cdHtcblx0XHRmb3IgKHZhciBpID0gYS50YWJsZS5sZW5ndGg7IGktLTsgKVxuXHRcdHtcblx0XHRcdGIgPSBmb2xkcihmLCBiLCBhLnRhYmxlW2ldKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGI7XG59XG5cbi8vIFRPRE86IGN1cnJlbnRseSwgaXQgc2xpY2VzIHRoZSByaWdodCwgdGhlbiB0aGUgbGVmdC4gVGhpcyBjYW4gYmVcbi8vIG9wdGltaXplZC5cbmZ1bmN0aW9uIHNsaWNlKGZyb20sIHRvLCBhKVxue1xuXHRpZiAoZnJvbSA8IDApXG5cdHtcblx0XHRmcm9tICs9IGxlbmd0aChhKTtcblx0fVxuXHRpZiAodG8gPCAwKVxuXHR7XG5cdFx0dG8gKz0gbGVuZ3RoKGEpO1xuXHR9XG5cdHJldHVybiBzbGljZUxlZnQoZnJvbSwgc2xpY2VSaWdodCh0bywgYSkpO1xufVxuXG5mdW5jdGlvbiBzbGljZVJpZ2h0KHRvLCBhKVxue1xuXHRpZiAodG8gPT09IGxlbmd0aChhKSlcblx0e1xuXHRcdHJldHVybiBhO1xuXHR9XG5cblx0Ly8gSGFuZGxlIGxlYWYgbGV2ZWwuXG5cdGlmIChhLmhlaWdodCA9PT0gMClcblx0e1xuXHRcdHZhciBuZXdBID0geyBjdG9yOidfQXJyYXknLCBoZWlnaHQ6MCB9O1xuXHRcdG5ld0EudGFibGUgPSBhLnRhYmxlLnNsaWNlKDAsIHRvKTtcblx0XHRyZXR1cm4gbmV3QTtcblx0fVxuXG5cdC8vIFNsaWNlIHRoZSByaWdodCByZWN1cnNpdmVseS5cblx0dmFyIHJpZ2h0ID0gZ2V0U2xvdCh0bywgYSk7XG5cdHZhciBzbGljZWQgPSBzbGljZVJpZ2h0KHRvIC0gKHJpZ2h0ID4gMCA/IGEubGVuZ3Roc1tyaWdodCAtIDFdIDogMCksIGEudGFibGVbcmlnaHRdKTtcblxuXHQvLyBNYXliZSB0aGUgYSBub2RlIGlzIG5vdCBldmVuIG5lZWRlZCwgYXMgc2xpY2VkIGNvbnRhaW5zIHRoZSB3aG9sZSBzbGljZS5cblx0aWYgKHJpZ2h0ID09PSAwKVxuXHR7XG5cdFx0cmV0dXJuIHNsaWNlZDtcblx0fVxuXG5cdC8vIENyZWF0ZSBuZXcgbm9kZS5cblx0dmFyIG5ld0EgPSB7XG5cdFx0Y3RvcjogJ19BcnJheScsXG5cdFx0aGVpZ2h0OiBhLmhlaWdodCxcblx0XHR0YWJsZTogYS50YWJsZS5zbGljZSgwLCByaWdodCksXG5cdFx0bGVuZ3RoczogYS5sZW5ndGhzLnNsaWNlKDAsIHJpZ2h0KVxuXHR9O1xuXHRpZiAoc2xpY2VkLnRhYmxlLmxlbmd0aCA+IDApXG5cdHtcblx0XHRuZXdBLnRhYmxlW3JpZ2h0XSA9IHNsaWNlZDtcblx0XHRuZXdBLmxlbmd0aHNbcmlnaHRdID0gbGVuZ3RoKHNsaWNlZCkgKyAocmlnaHQgPiAwID8gbmV3QS5sZW5ndGhzW3JpZ2h0IC0gMV0gOiAwKTtcblx0fVxuXHRyZXR1cm4gbmV3QTtcbn1cblxuZnVuY3Rpb24gc2xpY2VMZWZ0KGZyb20sIGEpXG57XG5cdGlmIChmcm9tID09PSAwKVxuXHR7XG5cdFx0cmV0dXJuIGE7XG5cdH1cblxuXHQvLyBIYW5kbGUgbGVhZiBsZXZlbC5cblx0aWYgKGEuaGVpZ2h0ID09PSAwKVxuXHR7XG5cdFx0dmFyIG5ld0EgPSB7IGN0b3I6J19BcnJheScsIGhlaWdodDowIH07XG5cdFx0bmV3QS50YWJsZSA9IGEudGFibGUuc2xpY2UoZnJvbSwgYS50YWJsZS5sZW5ndGggKyAxKTtcblx0XHRyZXR1cm4gbmV3QTtcblx0fVxuXG5cdC8vIFNsaWNlIHRoZSBsZWZ0IHJlY3Vyc2l2ZWx5LlxuXHR2YXIgbGVmdCA9IGdldFNsb3QoZnJvbSwgYSk7XG5cdHZhciBzbGljZWQgPSBzbGljZUxlZnQoZnJvbSAtIChsZWZ0ID4gMCA/IGEubGVuZ3Roc1tsZWZ0IC0gMV0gOiAwKSwgYS50YWJsZVtsZWZ0XSk7XG5cblx0Ly8gTWF5YmUgdGhlIGEgbm9kZSBpcyBub3QgZXZlbiBuZWVkZWQsIGFzIHNsaWNlZCBjb250YWlucyB0aGUgd2hvbGUgc2xpY2UuXG5cdGlmIChsZWZ0ID09PSBhLnRhYmxlLmxlbmd0aCAtIDEpXG5cdHtcblx0XHRyZXR1cm4gc2xpY2VkO1xuXHR9XG5cblx0Ly8gQ3JlYXRlIG5ldyBub2RlLlxuXHR2YXIgbmV3QSA9IHtcblx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRoZWlnaHQ6IGEuaGVpZ2h0LFxuXHRcdHRhYmxlOiBhLnRhYmxlLnNsaWNlKGxlZnQsIGEudGFibGUubGVuZ3RoICsgMSksXG5cdFx0bGVuZ3RoczogbmV3IEFycmF5KGEudGFibGUubGVuZ3RoIC0gbGVmdClcblx0fTtcblx0bmV3QS50YWJsZVswXSA9IHNsaWNlZDtcblx0dmFyIGxlbiA9IDA7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbmV3QS50YWJsZS5sZW5ndGg7IGkrKylcblx0e1xuXHRcdGxlbiArPSBsZW5ndGgobmV3QS50YWJsZVtpXSk7XG5cdFx0bmV3QS5sZW5ndGhzW2ldID0gbGVuO1xuXHR9XG5cblx0cmV0dXJuIG5ld0E7XG59XG5cbi8vIEFwcGVuZHMgdHdvIHRyZWVzLlxuZnVuY3Rpb24gYXBwZW5kKGEsYilcbntcblx0aWYgKGEudGFibGUubGVuZ3RoID09PSAwKVxuXHR7XG5cdFx0cmV0dXJuIGI7XG5cdH1cblx0aWYgKGIudGFibGUubGVuZ3RoID09PSAwKVxuXHR7XG5cdFx0cmV0dXJuIGE7XG5cdH1cblxuXHR2YXIgYyA9IGFwcGVuZF8oYSwgYik7XG5cblx0Ly8gQ2hlY2sgaWYgYm90aCBub2RlcyBjYW4gYmUgY3J1bnNoZWQgdG9nZXRoZXIuXG5cdGlmIChjWzBdLnRhYmxlLmxlbmd0aCArIGNbMV0udGFibGUubGVuZ3RoIDw9IE0pXG5cdHtcblx0XHRpZiAoY1swXS50YWJsZS5sZW5ndGggPT09IDApXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNbMV07XG5cdFx0fVxuXHRcdGlmIChjWzFdLnRhYmxlLmxlbmd0aCA9PT0gMClcblx0XHR7XG5cdFx0XHRyZXR1cm4gY1swXTtcblx0XHR9XG5cblx0XHQvLyBBZGp1c3QgLnRhYmxlIGFuZCAubGVuZ3Roc1xuXHRcdGNbMF0udGFibGUgPSBjWzBdLnRhYmxlLmNvbmNhdChjWzFdLnRhYmxlKTtcblx0XHRpZiAoY1swXS5oZWlnaHQgPiAwKVxuXHRcdHtcblx0XHRcdHZhciBsZW4gPSBsZW5ndGgoY1swXSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNbMV0ubGVuZ3Rocy5sZW5ndGg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0Y1sxXS5sZW5ndGhzW2ldICs9IGxlbjtcblx0XHRcdH1cblx0XHRcdGNbMF0ubGVuZ3RocyA9IGNbMF0ubGVuZ3Rocy5jb25jYXQoY1sxXS5sZW5ndGhzKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY1swXTtcblx0fVxuXG5cdGlmIChjWzBdLmhlaWdodCA+IDApXG5cdHtcblx0XHR2YXIgdG9SZW1vdmUgPSBjYWxjVG9SZW1vdmUoYSwgYik7XG5cdFx0aWYgKHRvUmVtb3ZlID4gRSlcblx0XHR7XG5cdFx0XHRjID0gc2h1ZmZsZShjWzBdLCBjWzFdLCB0b1JlbW92ZSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNpYmxpc2UoY1swXSwgY1sxXSk7XG59XG5cbi8vIFJldHVybnMgYW4gYXJyYXkgb2YgdHdvIG5vZGVzOyByaWdodCBhbmQgbGVmdC4gT25lIG5vZGUgX21heV8gYmUgZW1wdHkuXG5mdW5jdGlvbiBhcHBlbmRfKGEsIGIpXG57XG5cdGlmIChhLmhlaWdodCA9PT0gMCAmJiBiLmhlaWdodCA9PT0gMClcblx0e1xuXHRcdHJldHVybiBbYSwgYl07XG5cdH1cblxuXHRpZiAoYS5oZWlnaHQgIT09IDEgfHwgYi5oZWlnaHQgIT09IDEpXG5cdHtcblx0XHRpZiAoYS5oZWlnaHQgPT09IGIuaGVpZ2h0KVxuXHRcdHtcblx0XHRcdGEgPSBub2RlQ29weShhKTtcblx0XHRcdGIgPSBub2RlQ29weShiKTtcblx0XHRcdHZhciBhcHBlbmRlZCA9IGFwcGVuZF8oYm90UmlnaHQoYSksIGJvdExlZnQoYikpO1xuXG5cdFx0XHRpbnNlcnRSaWdodChhLCBhcHBlbmRlZFsxXSk7XG5cdFx0XHRpbnNlcnRMZWZ0KGIsIGFwcGVuZGVkWzBdKTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoYS5oZWlnaHQgPiBiLmhlaWdodClcblx0XHR7XG5cdFx0XHRhID0gbm9kZUNvcHkoYSk7XG5cdFx0XHR2YXIgYXBwZW5kZWQgPSBhcHBlbmRfKGJvdFJpZ2h0KGEpLCBiKTtcblxuXHRcdFx0aW5zZXJ0UmlnaHQoYSwgYXBwZW5kZWRbMF0pO1xuXHRcdFx0YiA9IHBhcmVudGlzZShhcHBlbmRlZFsxXSwgYXBwZW5kZWRbMV0uaGVpZ2h0ICsgMSk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRiID0gbm9kZUNvcHkoYik7XG5cdFx0XHR2YXIgYXBwZW5kZWQgPSBhcHBlbmRfKGEsIGJvdExlZnQoYikpO1xuXG5cdFx0XHR2YXIgbGVmdCA9IGFwcGVuZGVkWzBdLnRhYmxlLmxlbmd0aCA9PT0gMCA/IDAgOiAxO1xuXHRcdFx0dmFyIHJpZ2h0ID0gbGVmdCA9PT0gMCA/IDEgOiAwO1xuXHRcdFx0aW5zZXJ0TGVmdChiLCBhcHBlbmRlZFtsZWZ0XSk7XG5cdFx0XHRhID0gcGFyZW50aXNlKGFwcGVuZGVkW3JpZ2h0XSwgYXBwZW5kZWRbcmlnaHRdLmhlaWdodCArIDEpO1xuXHRcdH1cblx0fVxuXG5cdC8vIENoZWNrIGlmIGJhbGFuY2luZyBpcyBuZWVkZWQgYW5kIHJldHVybiBiYXNlZCBvbiB0aGF0LlxuXHRpZiAoYS50YWJsZS5sZW5ndGggPT09IDAgfHwgYi50YWJsZS5sZW5ndGggPT09IDApXG5cdHtcblx0XHRyZXR1cm4gW2EsIGJdO1xuXHR9XG5cblx0dmFyIHRvUmVtb3ZlID0gY2FsY1RvUmVtb3ZlKGEsIGIpO1xuXHRpZiAodG9SZW1vdmUgPD0gRSlcblx0e1xuXHRcdHJldHVybiBbYSwgYl07XG5cdH1cblx0cmV0dXJuIHNodWZmbGUoYSwgYiwgdG9SZW1vdmUpO1xufVxuXG4vLyBIZWxwZXJmdW5jdGlvbnMgZm9yIGFwcGVuZF8uIFJlcGxhY2VzIGEgY2hpbGQgbm9kZSBhdCB0aGUgc2lkZSBvZiB0aGUgcGFyZW50LlxuZnVuY3Rpb24gaW5zZXJ0UmlnaHQocGFyZW50LCBub2RlKVxue1xuXHR2YXIgaW5kZXggPSBwYXJlbnQudGFibGUubGVuZ3RoIC0gMTtcblx0cGFyZW50LnRhYmxlW2luZGV4XSA9IG5vZGU7XG5cdHBhcmVudC5sZW5ndGhzW2luZGV4XSA9IGxlbmd0aChub2RlKTtcblx0cGFyZW50Lmxlbmd0aHNbaW5kZXhdICs9IGluZGV4ID4gMCA/IHBhcmVudC5sZW5ndGhzW2luZGV4IC0gMV0gOiAwO1xufVxuXG5mdW5jdGlvbiBpbnNlcnRMZWZ0KHBhcmVudCwgbm9kZSlcbntcblx0aWYgKG5vZGUudGFibGUubGVuZ3RoID4gMClcblx0e1xuXHRcdHBhcmVudC50YWJsZVswXSA9IG5vZGU7XG5cdFx0cGFyZW50Lmxlbmd0aHNbMF0gPSBsZW5ndGgobm9kZSk7XG5cblx0XHR2YXIgbGVuID0gbGVuZ3RoKHBhcmVudC50YWJsZVswXSk7XG5cdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCBwYXJlbnQubGVuZ3Rocy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRsZW4gKz0gbGVuZ3RoKHBhcmVudC50YWJsZVtpXSk7XG5cdFx0XHRwYXJlbnQubGVuZ3Roc1tpXSA9IGxlbjtcblx0XHR9XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0cGFyZW50LnRhYmxlLnNoaWZ0KCk7XG5cdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCBwYXJlbnQubGVuZ3Rocy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRwYXJlbnQubGVuZ3Roc1tpXSA9IHBhcmVudC5sZW5ndGhzW2ldIC0gcGFyZW50Lmxlbmd0aHNbMF07XG5cdFx0fVxuXHRcdHBhcmVudC5sZW5ndGhzLnNoaWZ0KCk7XG5cdH1cbn1cblxuLy8gUmV0dXJucyB0aGUgZXh0cmEgc2VhcmNoIHN0ZXBzIGZvciBFLiBSZWZlciB0byB0aGUgcGFwZXIuXG5mdW5jdGlvbiBjYWxjVG9SZW1vdmUoYSwgYilcbntcblx0dmFyIHN1Ykxlbmd0aHMgPSAwO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGEudGFibGUubGVuZ3RoOyBpKyspXG5cdHtcblx0XHRzdWJMZW5ndGhzICs9IGEudGFibGVbaV0udGFibGUubGVuZ3RoO1xuXHR9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYi50YWJsZS5sZW5ndGg7IGkrKylcblx0e1xuXHRcdHN1Ykxlbmd0aHMgKz0gYi50YWJsZVtpXS50YWJsZS5sZW5ndGg7XG5cdH1cblxuXHR2YXIgdG9SZW1vdmUgPSBhLnRhYmxlLmxlbmd0aCArIGIudGFibGUubGVuZ3RoO1xuXHRyZXR1cm4gdG9SZW1vdmUgLSAoTWF0aC5mbG9vcigoc3ViTGVuZ3RocyAtIDEpIC8gTSkgKyAxKTtcbn1cblxuLy8gZ2V0Miwgc2V0MiBhbmQgc2F2ZVNsb3QgYXJlIGhlbHBlcnMgZm9yIGFjY2Vzc2luZyBlbGVtZW50cyBvdmVyIHR3byBhcnJheXMuXG5mdW5jdGlvbiBnZXQyKGEsIGIsIGluZGV4KVxue1xuXHRyZXR1cm4gaW5kZXggPCBhLmxlbmd0aFxuXHRcdD8gYVtpbmRleF1cblx0XHQ6IGJbaW5kZXggLSBhLmxlbmd0aF07XG59XG5cbmZ1bmN0aW9uIHNldDIoYSwgYiwgaW5kZXgsIHZhbHVlKVxue1xuXHRpZiAoaW5kZXggPCBhLmxlbmd0aClcblx0e1xuXHRcdGFbaW5kZXhdID0gdmFsdWU7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0YltpbmRleCAtIGEubGVuZ3RoXSA9IHZhbHVlO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHNhdmVTbG90KGEsIGIsIGluZGV4LCBzbG90KVxue1xuXHRzZXQyKGEudGFibGUsIGIudGFibGUsIGluZGV4LCBzbG90KTtcblxuXHR2YXIgbCA9IChpbmRleCA9PT0gMCB8fCBpbmRleCA9PT0gYS5sZW5ndGhzLmxlbmd0aClcblx0XHQ/IDBcblx0XHQ6IGdldDIoYS5sZW5ndGhzLCBhLmxlbmd0aHMsIGluZGV4IC0gMSk7XG5cblx0c2V0MihhLmxlbmd0aHMsIGIubGVuZ3RocywgaW5kZXgsIGwgKyBsZW5ndGgoc2xvdCkpO1xufVxuXG4vLyBDcmVhdGVzIGEgbm9kZSBvciBsZWFmIHdpdGggYSBnaXZlbiBsZW5ndGggYXQgdGhlaXIgYXJyYXlzIGZvciBwZXJmb21hbmNlLlxuLy8gSXMgb25seSB1c2VkIGJ5IHNodWZmbGUuXG5mdW5jdGlvbiBjcmVhdGVOb2RlKGgsIGxlbmd0aClcbntcblx0aWYgKGxlbmd0aCA8IDApXG5cdHtcblx0XHRsZW5ndGggPSAwO1xuXHR9XG5cdHZhciBhID0ge1xuXHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdGhlaWdodDogaCxcblx0XHR0YWJsZTogbmV3IEFycmF5KGxlbmd0aClcblx0fTtcblx0aWYgKGggPiAwKVxuXHR7XG5cdFx0YS5sZW5ndGhzID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cdH1cblx0cmV0dXJuIGE7XG59XG5cbi8vIFJldHVybnMgYW4gYXJyYXkgb2YgdHdvIGJhbGFuY2VkIG5vZGVzLlxuZnVuY3Rpb24gc2h1ZmZsZShhLCBiLCB0b1JlbW92ZSlcbntcblx0dmFyIG5ld0EgPSBjcmVhdGVOb2RlKGEuaGVpZ2h0LCBNYXRoLm1pbihNLCBhLnRhYmxlLmxlbmd0aCArIGIudGFibGUubGVuZ3RoIC0gdG9SZW1vdmUpKTtcblx0dmFyIG5ld0IgPSBjcmVhdGVOb2RlKGEuaGVpZ2h0LCBuZXdBLnRhYmxlLmxlbmd0aCAtIChhLnRhYmxlLmxlbmd0aCArIGIudGFibGUubGVuZ3RoIC0gdG9SZW1vdmUpKTtcblxuXHQvLyBTa2lwIHRoZSBzbG90cyB3aXRoIHNpemUgTS4gTW9yZSBwcmVjaXNlOiBjb3B5IHRoZSBzbG90IHJlZmVyZW5jZXNcblx0Ly8gdG8gdGhlIG5ldyBub2RlXG5cdHZhciByZWFkID0gMDtcblx0d2hpbGUgKGdldDIoYS50YWJsZSwgYi50YWJsZSwgcmVhZCkudGFibGUubGVuZ3RoICUgTSA9PT0gMClcblx0e1xuXHRcdHNldDIobmV3QS50YWJsZSwgbmV3Qi50YWJsZSwgcmVhZCwgZ2V0MihhLnRhYmxlLCBiLnRhYmxlLCByZWFkKSk7XG5cdFx0c2V0MihuZXdBLmxlbmd0aHMsIG5ld0IubGVuZ3RocywgcmVhZCwgZ2V0MihhLmxlbmd0aHMsIGIubGVuZ3RocywgcmVhZCkpO1xuXHRcdHJlYWQrKztcblx0fVxuXG5cdC8vIFB1bGxpbmcgaXRlbXMgZnJvbSBsZWZ0IHRvIHJpZ2h0LCBjYWNoaW5nIGluIGEgc2xvdCBiZWZvcmUgd3JpdGluZ1xuXHQvLyBpdCBpbnRvIHRoZSBuZXcgbm9kZXMuXG5cdHZhciB3cml0ZSA9IHJlYWQ7XG5cdHZhciBzbG90ID0gbmV3IGNyZWF0ZU5vZGUoYS5oZWlnaHQgLSAxLCAwKTtcblx0dmFyIGZyb20gPSAwO1xuXG5cdC8vIElmIHRoZSBjdXJyZW50IHNsb3QgaXMgc3RpbGwgY29udGFpbmluZyBkYXRhLCB0aGVuIHRoZXJlIHdpbGwgYmUgYXRcblx0Ly8gbGVhc3Qgb25lIG1vcmUgd3JpdGUsIHNvIHdlIGRvIG5vdCBicmVhayB0aGlzIGxvb3AgeWV0LlxuXHR3aGlsZSAocmVhZCAtIHdyaXRlIC0gKHNsb3QudGFibGUubGVuZ3RoID4gMCA/IDEgOiAwKSA8IHRvUmVtb3ZlKVxuXHR7XG5cdFx0Ly8gRmluZCBvdXQgdGhlIG1heCBwb3NzaWJsZSBpdGVtcyBmb3IgY29weWluZy5cblx0XHR2YXIgc291cmNlID0gZ2V0MihhLnRhYmxlLCBiLnRhYmxlLCByZWFkKTtcblx0XHR2YXIgdG8gPSBNYXRoLm1pbihNIC0gc2xvdC50YWJsZS5sZW5ndGgsIHNvdXJjZS50YWJsZS5sZW5ndGgpO1xuXG5cdFx0Ly8gQ29weSBhbmQgYWRqdXN0IHNpemUgdGFibGUuXG5cdFx0c2xvdC50YWJsZSA9IHNsb3QudGFibGUuY29uY2F0KHNvdXJjZS50YWJsZS5zbGljZShmcm9tLCB0bykpO1xuXHRcdGlmIChzbG90LmhlaWdodCA+IDApXG5cdFx0e1xuXHRcdFx0dmFyIGxlbiA9IHNsb3QubGVuZ3Rocy5sZW5ndGg7XG5cdFx0XHRmb3IgKHZhciBpID0gbGVuOyBpIDwgbGVuICsgdG8gLSBmcm9tOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHNsb3QubGVuZ3Roc1tpXSA9IGxlbmd0aChzbG90LnRhYmxlW2ldKTtcblx0XHRcdFx0c2xvdC5sZW5ndGhzW2ldICs9IChpID4gMCA/IHNsb3QubGVuZ3Roc1tpIC0gMV0gOiAwKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmcm9tICs9IHRvO1xuXG5cdFx0Ly8gT25seSBwcm9jZWVkIHRvIG5leHQgc2xvdHNbaV0gaWYgdGhlIGN1cnJlbnQgb25lIHdhc1xuXHRcdC8vIGZ1bGx5IGNvcGllZC5cblx0XHRpZiAoc291cmNlLnRhYmxlLmxlbmd0aCA8PSB0bylcblx0XHR7XG5cdFx0XHRyZWFkKys7IGZyb20gPSAwO1xuXHRcdH1cblxuXHRcdC8vIE9ubHkgY3JlYXRlIGEgbmV3IHNsb3QgaWYgdGhlIGN1cnJlbnQgb25lIGlzIGZpbGxlZCB1cC5cblx0XHRpZiAoc2xvdC50YWJsZS5sZW5ndGggPT09IE0pXG5cdFx0e1xuXHRcdFx0c2F2ZVNsb3QobmV3QSwgbmV3Qiwgd3JpdGUsIHNsb3QpO1xuXHRcdFx0c2xvdCA9IGNyZWF0ZU5vZGUoYS5oZWlnaHQgLSAxLCAwKTtcblx0XHRcdHdyaXRlKys7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2xlYW51cCBhZnRlciB0aGUgbG9vcC4gQ29weSB0aGUgbGFzdCBzbG90IGludG8gdGhlIG5ldyBub2Rlcy5cblx0aWYgKHNsb3QudGFibGUubGVuZ3RoID4gMClcblx0e1xuXHRcdHNhdmVTbG90KG5ld0EsIG5ld0IsIHdyaXRlLCBzbG90KTtcblx0XHR3cml0ZSsrO1xuXHR9XG5cblx0Ly8gU2hpZnQgdGhlIHVudG91Y2hlZCBzbG90cyB0byB0aGUgbGVmdFxuXHR3aGlsZSAocmVhZCA8IGEudGFibGUubGVuZ3RoICsgYi50YWJsZS5sZW5ndGggKVxuXHR7XG5cdFx0c2F2ZVNsb3QobmV3QSwgbmV3Qiwgd3JpdGUsIGdldDIoYS50YWJsZSwgYi50YWJsZSwgcmVhZCkpO1xuXHRcdHJlYWQrKztcblx0XHR3cml0ZSsrO1xuXHR9XG5cblx0cmV0dXJuIFtuZXdBLCBuZXdCXTtcbn1cblxuLy8gTmF2aWdhdGlvbiBmdW5jdGlvbnNcbmZ1bmN0aW9uIGJvdFJpZ2h0KGEpXG57XG5cdHJldHVybiBhLnRhYmxlW2EudGFibGUubGVuZ3RoIC0gMV07XG59XG5mdW5jdGlvbiBib3RMZWZ0KGEpXG57XG5cdHJldHVybiBhLnRhYmxlWzBdO1xufVxuXG4vLyBDb3BpZXMgYSBub2RlIGZvciB1cGRhdGluZy4gTm90ZSB0aGF0IHlvdSBzaG91bGQgbm90IHVzZSB0aGlzIGlmXG4vLyBvbmx5IHVwZGF0aW5nIG9ubHkgb25lIG9mIFwidGFibGVcIiBvciBcImxlbmd0aHNcIiBmb3IgcGVyZm9ybWFuY2UgcmVhc29ucy5cbmZ1bmN0aW9uIG5vZGVDb3B5KGEpXG57XG5cdHZhciBuZXdBID0ge1xuXHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdGhlaWdodDogYS5oZWlnaHQsXG5cdFx0dGFibGU6IGEudGFibGUuc2xpY2UoKVxuXHR9O1xuXHRpZiAoYS5oZWlnaHQgPiAwKVxuXHR7XG5cdFx0bmV3QS5sZW5ndGhzID0gYS5sZW5ndGhzLnNsaWNlKCk7XG5cdH1cblx0cmV0dXJuIG5ld0E7XG59XG5cbi8vIFJldHVybnMgaG93IG1hbnkgaXRlbXMgYXJlIGluIHRoZSB0cmVlLlxuZnVuY3Rpb24gbGVuZ3RoKGFycmF5KVxue1xuXHRpZiAoYXJyYXkuaGVpZ2h0ID09PSAwKVxuXHR7XG5cdFx0cmV0dXJuIGFycmF5LnRhYmxlLmxlbmd0aDtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRyZXR1cm4gYXJyYXkubGVuZ3Roc1thcnJheS5sZW5ndGhzLmxlbmd0aCAtIDFdO1xuXHR9XG59XG5cbi8vIENhbGN1bGF0ZXMgaW4gd2hpY2ggc2xvdCBvZiBcInRhYmxlXCIgdGhlIGl0ZW0gcHJvYmFibHkgaXMsIHRoZW5cbi8vIGZpbmQgdGhlIGV4YWN0IHNsb3QgdmlhIGZvcndhcmQgc2VhcmNoaW5nIGluICBcImxlbmd0aHNcIi4gUmV0dXJucyB0aGUgaW5kZXguXG5mdW5jdGlvbiBnZXRTbG90KGksIGEpXG57XG5cdHZhciBzbG90ID0gaSA+PiAoNSAqIGEuaGVpZ2h0KTtcblx0d2hpbGUgKGEubGVuZ3Roc1tzbG90XSA8PSBpKVxuXHR7XG5cdFx0c2xvdCsrO1xuXHR9XG5cdHJldHVybiBzbG90O1xufVxuXG4vLyBSZWN1cnNpdmVseSBjcmVhdGVzIGEgdHJlZSB3aXRoIGEgZ2l2ZW4gaGVpZ2h0IGNvbnRhaW5pbmdcbi8vIG9ubHkgdGhlIGdpdmVuIGl0ZW0uXG5mdW5jdGlvbiBjcmVhdGUoaXRlbSwgaClcbntcblx0aWYgKGggPT09IDApXG5cdHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y3RvcjogJ19BcnJheScsXG5cdFx0XHRoZWlnaHQ6IDAsXG5cdFx0XHR0YWJsZTogW2l0ZW1dXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdGhlaWdodDogaCxcblx0XHR0YWJsZTogW2NyZWF0ZShpdGVtLCBoIC0gMSldLFxuXHRcdGxlbmd0aHM6IFsxXVxuXHR9O1xufVxuXG4vLyBSZWN1cnNpdmVseSBjcmVhdGVzIGEgdHJlZSB0aGF0IGNvbnRhaW5zIHRoZSBnaXZlbiB0cmVlLlxuZnVuY3Rpb24gcGFyZW50aXNlKHRyZWUsIGgpXG57XG5cdGlmIChoID09PSB0cmVlLmhlaWdodClcblx0e1xuXHRcdHJldHVybiB0cmVlO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRoZWlnaHQ6IGgsXG5cdFx0dGFibGU6IFtwYXJlbnRpc2UodHJlZSwgaCAtIDEpXSxcblx0XHRsZW5ndGhzOiBbbGVuZ3RoKHRyZWUpXVxuXHR9O1xufVxuXG4vLyBFbXBoYXNpemVzIGJsb29kIGJyb3RoZXJob29kIGJlbmVhdGggdHdvIHRyZWVzLlxuZnVuY3Rpb24gc2libGlzZShhLCBiKVxue1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdGhlaWdodDogYS5oZWlnaHQgKyAxLFxuXHRcdHRhYmxlOiBbYSwgYl0sXG5cdFx0bGVuZ3RoczogW2xlbmd0aChhKSwgbGVuZ3RoKGEpICsgbGVuZ3RoKGIpXVxuXHR9O1xufVxuXG5mdW5jdGlvbiB0b0pTQXJyYXkoYSlcbntcblx0dmFyIGpzQXJyYXkgPSBuZXcgQXJyYXkobGVuZ3RoKGEpKTtcblx0dG9KU0FycmF5Xyhqc0FycmF5LCAwLCBhKTtcblx0cmV0dXJuIGpzQXJyYXk7XG59XG5cbmZ1bmN0aW9uIHRvSlNBcnJheV8oanNBcnJheSwgaSwgYSlcbntcblx0Zm9yICh2YXIgdCA9IDA7IHQgPCBhLnRhYmxlLmxlbmd0aDsgdCsrKVxuXHR7XG5cdFx0aWYgKGEuaGVpZ2h0ID09PSAwKVxuXHRcdHtcblx0XHRcdGpzQXJyYXlbaSArIHRdID0gYS50YWJsZVt0XTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHZhciBpbmMgPSB0ID09PSAwID8gMCA6IGEubGVuZ3Roc1t0IC0gMV07XG5cdFx0XHR0b0pTQXJyYXlfKGpzQXJyYXksIGkgKyBpbmMsIGEudGFibGVbdF0pO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBmcm9tSlNBcnJheShqc0FycmF5KVxue1xuXHRpZiAoanNBcnJheS5sZW5ndGggPT09IDApXG5cdHtcblx0XHRyZXR1cm4gZW1wdHk7XG5cdH1cblx0dmFyIGggPSBNYXRoLmZsb29yKE1hdGgubG9nKGpzQXJyYXkubGVuZ3RoKSAvIE1hdGgubG9nKE0pKTtcblx0cmV0dXJuIGZyb21KU0FycmF5Xyhqc0FycmF5LCBoLCAwLCBqc0FycmF5Lmxlbmd0aCk7XG59XG5cbmZ1bmN0aW9uIGZyb21KU0FycmF5Xyhqc0FycmF5LCBoLCBmcm9tLCB0bylcbntcblx0aWYgKGggPT09IDApXG5cdHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y3RvcjogJ19BcnJheScsXG5cdFx0XHRoZWlnaHQ6IDAsXG5cdFx0XHR0YWJsZToganNBcnJheS5zbGljZShmcm9tLCB0bylcblx0XHR9O1xuXHR9XG5cblx0dmFyIHN0ZXAgPSBNYXRoLnBvdyhNLCBoKTtcblx0dmFyIHRhYmxlID0gbmV3IEFycmF5KE1hdGguY2VpbCgodG8gLSBmcm9tKSAvIHN0ZXApKTtcblx0dmFyIGxlbmd0aHMgPSBuZXcgQXJyYXkodGFibGUubGVuZ3RoKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0YWJsZS5sZW5ndGg7IGkrKylcblx0e1xuXHRcdHRhYmxlW2ldID0gZnJvbUpTQXJyYXlfKGpzQXJyYXksIGggLSAxLCBmcm9tICsgKGkgKiBzdGVwKSwgTWF0aC5taW4oZnJvbSArICgoaSArIDEpICogc3RlcCksIHRvKSk7XG5cdFx0bGVuZ3Roc1tpXSA9IGxlbmd0aCh0YWJsZVtpXSkgKyAoaSA+IDAgPyBsZW5ndGhzW2kgLSAxXSA6IDApO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJ19BcnJheScsXG5cdFx0aGVpZ2h0OiBoLFxuXHRcdHRhYmxlOiB0YWJsZSxcblx0XHRsZW5ndGhzOiBsZW5ndGhzXG5cdH07XG59XG5cbnJldHVybiB7XG5cdGVtcHR5OiBlbXB0eSxcblx0ZnJvbUxpc3Q6IGZyb21MaXN0LFxuXHR0b0xpc3Q6IHRvTGlzdCxcblx0aW5pdGlhbGl6ZTogRjIoaW5pdGlhbGl6ZSksXG5cdGFwcGVuZDogRjIoYXBwZW5kKSxcblx0cHVzaDogRjIocHVzaCksXG5cdHNsaWNlOiBGMyhzbGljZSksXG5cdGdldDogRjIoZ2V0KSxcblx0c2V0OiBGMyhzZXQpLFxuXHRtYXA6IEYyKG1hcCksXG5cdGluZGV4ZWRNYXA6IEYyKGluZGV4ZWRNYXApLFxuXHRmb2xkbDogRjMoZm9sZGwpLFxuXHRmb2xkcjogRjMoZm9sZHIpLFxuXHRsZW5ndGg6IGxlbmd0aCxcblxuXHR0b0pTQXJyYXk6IHRvSlNBcnJheSxcblx0ZnJvbUpTQXJyYXk6IGZyb21KU0FycmF5XG59O1xuXG59KCk7XG4vL2ltcG9ydCBOYXRpdmUuVXRpbHMgLy9cblxudmFyIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MgPSBmdW5jdGlvbigpIHtcblxuZnVuY3Rpb24gZGl2KGEsIGIpXG57XG5cdHJldHVybiAoYSAvIGIpIHwgMDtcbn1cbmZ1bmN0aW9uIHJlbShhLCBiKVxue1xuXHRyZXR1cm4gYSAlIGI7XG59XG5mdW5jdGlvbiBtb2QoYSwgYilcbntcblx0aWYgKGIgPT09IDApXG5cdHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBwZXJmb3JtIG1vZCAwLiBEaXZpc2lvbiBieSB6ZXJvIGVycm9yLicpO1xuXHR9XG5cdHZhciByID0gYSAlIGI7XG5cdHZhciBtID0gYSA9PT0gMCA/IDAgOiAoYiA+IDAgPyAoYSA+PSAwID8gciA6IHIgKyBiKSA6IC1tb2QoLWEsIC1iKSk7XG5cblx0cmV0dXJuIG0gPT09IGIgPyAwIDogbTtcbn1cbmZ1bmN0aW9uIGxvZ0Jhc2UoYmFzZSwgbilcbntcblx0cmV0dXJuIE1hdGgubG9nKG4pIC8gTWF0aC5sb2coYmFzZSk7XG59XG5mdW5jdGlvbiBuZWdhdGUobilcbntcblx0cmV0dXJuIC1uO1xufVxuZnVuY3Rpb24gYWJzKG4pXG57XG5cdHJldHVybiBuIDwgMCA/IC1uIDogbjtcbn1cblxuZnVuY3Rpb24gbWluKGEsIGIpXG57XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY21wKGEsIGIpIDwgMCA/IGEgOiBiO1xufVxuZnVuY3Rpb24gbWF4KGEsIGIpXG57XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY21wKGEsIGIpID4gMCA/IGEgOiBiO1xufVxuZnVuY3Rpb24gY2xhbXAobG8sIGhpLCBuKVxue1xuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNtcChuLCBsbykgPCAwXG5cdFx0PyBsb1xuXHRcdDogX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNtcChuLCBoaSkgPiAwXG5cdFx0XHQ/IGhpXG5cdFx0XHQ6IG47XG59XG5cbnZhciBvcmQgPSBbJ0xUJywgJ0VRJywgJ0dUJ107XG5cbmZ1bmN0aW9uIGNvbXBhcmUoeCwgeSlcbntcblx0cmV0dXJuIHsgY3Rvcjogb3JkW19lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jbXAoeCwgeSkgKyAxXSB9O1xufVxuXG5mdW5jdGlvbiB4b3IoYSwgYilcbntcblx0cmV0dXJuIGEgIT09IGI7XG59XG5mdW5jdGlvbiBub3QoYilcbntcblx0cmV0dXJuICFiO1xufVxuZnVuY3Rpb24gaXNJbmZpbml0ZShuKVxue1xuXHRyZXR1cm4gbiA9PT0gSW5maW5pdHkgfHwgbiA9PT0gLUluZmluaXR5O1xufVxuXG5mdW5jdGlvbiB0cnVuY2F0ZShuKVxue1xuXHRyZXR1cm4gbiB8IDA7XG59XG5cbmZ1bmN0aW9uIGRlZ3JlZXMoZClcbntcblx0cmV0dXJuIGQgKiBNYXRoLlBJIC8gMTgwO1xufVxuZnVuY3Rpb24gdHVybnModClcbntcblx0cmV0dXJuIDIgKiBNYXRoLlBJICogdDtcbn1cbmZ1bmN0aW9uIGZyb21Qb2xhcihwb2ludClcbntcblx0dmFyIHIgPSBwb2ludC5fMDtcblx0dmFyIHQgPSBwb2ludC5fMTtcblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5UdXBsZTIociAqIE1hdGguY29zKHQpLCByICogTWF0aC5zaW4odCkpO1xufVxuZnVuY3Rpb24gdG9Qb2xhcihwb2ludClcbntcblx0dmFyIHggPSBwb2ludC5fMDtcblx0dmFyIHkgPSBwb2ludC5fMTtcblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5UdXBsZTIoTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkpLCBNYXRoLmF0YW4yKHksIHgpKTtcbn1cblxucmV0dXJuIHtcblx0ZGl2OiBGMihkaXYpLFxuXHRyZW06IEYyKHJlbSksXG5cdG1vZDogRjIobW9kKSxcblxuXHRwaTogTWF0aC5QSSxcblx0ZTogTWF0aC5FLFxuXHRjb3M6IE1hdGguY29zLFxuXHRzaW46IE1hdGguc2luLFxuXHR0YW46IE1hdGgudGFuLFxuXHRhY29zOiBNYXRoLmFjb3MsXG5cdGFzaW46IE1hdGguYXNpbixcblx0YXRhbjogTWF0aC5hdGFuLFxuXHRhdGFuMjogRjIoTWF0aC5hdGFuMiksXG5cblx0ZGVncmVlczogZGVncmVlcyxcblx0dHVybnM6IHR1cm5zLFxuXHRmcm9tUG9sYXI6IGZyb21Qb2xhcixcblx0dG9Qb2xhcjogdG9Qb2xhcixcblxuXHRzcXJ0OiBNYXRoLnNxcnQsXG5cdGxvZ0Jhc2U6IEYyKGxvZ0Jhc2UpLFxuXHRuZWdhdGU6IG5lZ2F0ZSxcblx0YWJzOiBhYnMsXG5cdG1pbjogRjIobWluKSxcblx0bWF4OiBGMihtYXgpLFxuXHRjbGFtcDogRjMoY2xhbXApLFxuXHRjb21wYXJlOiBGMihjb21wYXJlKSxcblxuXHR4b3I6IEYyKHhvciksXG5cdG5vdDogbm90LFxuXG5cdHRydW5jYXRlOiB0cnVuY2F0ZSxcblx0Y2VpbGluZzogTWF0aC5jZWlsLFxuXHRmbG9vcjogTWF0aC5mbG9vcixcblx0cm91bmQ6IE1hdGgucm91bmQsXG5cdHRvRmxvYXQ6IGZ1bmN0aW9uKHgpIHsgcmV0dXJuIHg7IH0sXG5cdGlzTmFOOiBpc05hTixcblx0aXNJbmZpbml0ZTogaXNJbmZpbml0ZVxufTtcblxufSgpO1xuLy9pbXBvcnQgLy9cblxudmFyIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscyA9IGZ1bmN0aW9uKCkge1xuXG4vLyBDT01QQVJJU09OU1xuXG5mdW5jdGlvbiBlcSh4LCB5KVxue1xuXHR2YXIgc3RhY2sgPSBbXTtcblx0dmFyIGlzRXF1YWwgPSBlcUhlbHAoeCwgeSwgMCwgc3RhY2spO1xuXHR2YXIgcGFpcjtcblx0d2hpbGUgKGlzRXF1YWwgJiYgKHBhaXIgPSBzdGFjay5wb3AoKSkpXG5cdHtcblx0XHRpc0VxdWFsID0gZXFIZWxwKHBhaXIueCwgcGFpci55LCAwLCBzdGFjayk7XG5cdH1cblx0cmV0dXJuIGlzRXF1YWw7XG59XG5cblxuZnVuY3Rpb24gZXFIZWxwKHgsIHksIGRlcHRoLCBzdGFjaylcbntcblx0aWYgKGRlcHRoID4gMTAwKVxuXHR7XG5cdFx0c3RhY2sucHVzaCh7IHg6IHgsIHk6IHkgfSk7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoeCA9PT0geSlcblx0e1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKHR5cGVvZiB4ICE9PSAnb2JqZWN0Jylcblx0e1xuXHRcdGlmICh0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJylcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdCdUcnlpbmcgdG8gdXNlIGAoPT0pYCBvbiBmdW5jdGlvbnMuIFRoZXJlIGlzIG5vIHdheSB0byBrbm93IGlmIGZ1bmN0aW9ucyBhcmUgXCJ0aGUgc2FtZVwiIGluIHRoZSBFbG0gc2Vuc2UuJ1xuXHRcdFx0XHQrICcgUmVhZCBtb3JlIGFib3V0IHRoaXMgYXQgaHR0cDovL3BhY2thZ2UuZWxtLWxhbmcub3JnL3BhY2thZ2VzL2VsbS1sYW5nL2NvcmUvbGF0ZXN0L0Jhc2ljcyM9PSdcblx0XHRcdFx0KyAnIHdoaWNoIGRlc2NyaWJlcyB3aHkgaXQgaXMgdGhpcyB3YXkgYW5kIHdoYXQgdGhlIGJldHRlciB2ZXJzaW9uIHdpbGwgbG9vayBsaWtlLidcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGlmICh4ID09PSBudWxsIHx8IHkgPT09IG51bGwpXG5cdHtcblx0XHRyZXR1cm4gZmFsc2Vcblx0fVxuXG5cdGlmICh4IGluc3RhbmNlb2YgRGF0ZSlcblx0e1xuXHRcdHJldHVybiB4LmdldFRpbWUoKSA9PT0geS5nZXRUaW1lKCk7XG5cdH1cblxuXHRpZiAoISgnY3RvcicgaW4geCkpXG5cdHtcblx0XHRmb3IgKHZhciBrZXkgaW4geClcblx0XHR7XG5cdFx0XHRpZiAoIWVxSGVscCh4W2tleV0sIHlba2V5XSwgZGVwdGggKyAxLCBzdGFjaykpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvLyBjb252ZXJ0IERpY3RzIGFuZCBTZXRzIHRvIGxpc3RzXG5cdGlmICh4LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nIHx8IHguY3RvciA9PT0gJ1JCRW1wdHlfZWxtX2J1aWx0aW4nKVxuXHR7XG5cdFx0eCA9IF9lbG1fbGFuZyRjb3JlJERpY3QkdG9MaXN0KHgpO1xuXHRcdHkgPSBfZWxtX2xhbmckY29yZSREaWN0JHRvTGlzdCh5KTtcblx0fVxuXHRpZiAoeC5jdG9yID09PSAnU2V0X2VsbV9idWlsdGluJylcblx0e1xuXHRcdHggPSBfZWxtX2xhbmckY29yZSRTZXQkdG9MaXN0KHgpO1xuXHRcdHkgPSBfZWxtX2xhbmckY29yZSRTZXQkdG9MaXN0KHkpO1xuXHR9XG5cblx0Ly8gY2hlY2sgaWYgbGlzdHMgYXJlIGVxdWFsIHdpdGhvdXQgcmVjdXJzaW9uXG5cdGlmICh4LmN0b3IgPT09ICc6OicpXG5cdHtcblx0XHR2YXIgYSA9IHg7XG5cdFx0dmFyIGIgPSB5O1xuXHRcdHdoaWxlIChhLmN0b3IgPT09ICc6OicgJiYgYi5jdG9yID09PSAnOjonKVxuXHRcdHtcblx0XHRcdGlmICghZXFIZWxwKGEuXzAsIGIuXzAsIGRlcHRoICsgMSwgc3RhY2spKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRhID0gYS5fMTtcblx0XHRcdGIgPSBiLl8xO1xuXHRcdH1cblx0XHRyZXR1cm4gYS5jdG9yID09PSBiLmN0b3I7XG5cdH1cblxuXHQvLyBjaGVjayBpZiBBcnJheXMgYXJlIGVxdWFsXG5cdGlmICh4LmN0b3IgPT09ICdfQXJyYXknKVxuXHR7XG5cdFx0dmFyIHhzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LnRvSlNBcnJheSh4KTtcblx0XHR2YXIgeXMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkudG9KU0FycmF5KHkpO1xuXHRcdGlmICh4cy5sZW5ndGggIT09IHlzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0aWYgKCFlcUhlbHAoeHNbaV0sIHlzW2ldLCBkZXB0aCArIDEsIHN0YWNrKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmICghZXFIZWxwKHguY3RvciwgeS5jdG9yLCBkZXB0aCArIDEsIHN0YWNrKSlcblx0e1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdGZvciAodmFyIGtleSBpbiB4KVxuXHR7XG5cdFx0aWYgKCFlcUhlbHAoeFtrZXldLCB5W2tleV0sIGRlcHRoICsgMSwgc3RhY2spKVxuXHRcdHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRydWU7XG59XG5cbi8vIENvZGUgaW4gR2VuZXJhdGUvSmF2YVNjcmlwdC5ocywgQmFzaWNzLmpzLCBhbmQgTGlzdC5qcyBkZXBlbmRzIG9uXG4vLyB0aGUgcGFydGljdWxhciBpbnRlZ2VyIHZhbHVlcyBhc3NpZ25lZCB0byBMVCwgRVEsIGFuZCBHVC5cblxudmFyIExUID0gLTEsIEVRID0gMCwgR1QgPSAxO1xuXG5mdW5jdGlvbiBjbXAoeCwgeSlcbntcblx0aWYgKHR5cGVvZiB4ICE9PSAnb2JqZWN0Jylcblx0e1xuXHRcdHJldHVybiB4ID09PSB5ID8gRVEgOiB4IDwgeSA/IExUIDogR1Q7XG5cdH1cblxuXHRpZiAoeCBpbnN0YW5jZW9mIFN0cmluZylcblx0e1xuXHRcdHZhciBhID0geC52YWx1ZU9mKCk7XG5cdFx0dmFyIGIgPSB5LnZhbHVlT2YoKTtcblx0XHRyZXR1cm4gYSA9PT0gYiA/IEVRIDogYSA8IGIgPyBMVCA6IEdUO1xuXHR9XG5cblx0aWYgKHguY3RvciA9PT0gJzo6JyB8fCB4LmN0b3IgPT09ICdbXScpXG5cdHtcblx0XHR3aGlsZSAoeC5jdG9yID09PSAnOjonICYmIHkuY3RvciA9PT0gJzo6Jylcblx0XHR7XG5cdFx0XHR2YXIgb3JkID0gY21wKHguXzAsIHkuXzApO1xuXHRcdFx0aWYgKG9yZCAhPT0gRVEpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBvcmQ7XG5cdFx0XHR9XG5cdFx0XHR4ID0geC5fMTtcblx0XHRcdHkgPSB5Ll8xO1xuXHRcdH1cblx0XHRyZXR1cm4geC5jdG9yID09PSB5LmN0b3IgPyBFUSA6IHguY3RvciA9PT0gJ1tdJyA/IExUIDogR1Q7XG5cdH1cblxuXHRpZiAoeC5jdG9yLnNsaWNlKDAsIDYpID09PSAnX1R1cGxlJylcblx0e1xuXHRcdHZhciBvcmQ7XG5cdFx0dmFyIG4gPSB4LmN0b3Iuc2xpY2UoNikgLSAwO1xuXHRcdHZhciBlcnIgPSAnY2Fubm90IGNvbXBhcmUgdHVwbGVzIHdpdGggbW9yZSB0aGFuIDYgZWxlbWVudHMuJztcblx0XHRpZiAobiA9PT0gMCkgcmV0dXJuIEVRO1xuXHRcdGlmIChuID49IDEpIHsgb3JkID0gY21wKHguXzAsIHkuXzApOyBpZiAob3JkICE9PSBFUSkgcmV0dXJuIG9yZDtcblx0XHRpZiAobiA+PSAyKSB7IG9yZCA9IGNtcCh4Ll8xLCB5Ll8xKTsgaWYgKG9yZCAhPT0gRVEpIHJldHVybiBvcmQ7XG5cdFx0aWYgKG4gPj0gMykgeyBvcmQgPSBjbXAoeC5fMiwgeS5fMik7IGlmIChvcmQgIT09IEVRKSByZXR1cm4gb3JkO1xuXHRcdGlmIChuID49IDQpIHsgb3JkID0gY21wKHguXzMsIHkuXzMpOyBpZiAob3JkICE9PSBFUSkgcmV0dXJuIG9yZDtcblx0XHRpZiAobiA+PSA1KSB7IG9yZCA9IGNtcCh4Ll80LCB5Ll80KTsgaWYgKG9yZCAhPT0gRVEpIHJldHVybiBvcmQ7XG5cdFx0aWYgKG4gPj0gNikgeyBvcmQgPSBjbXAoeC5fNSwgeS5fNSk7IGlmIChvcmQgIT09IEVRKSByZXR1cm4gb3JkO1xuXHRcdGlmIChuID49IDcpIHRocm93IG5ldyBFcnJvcignQ29tcGFyaXNvbiBlcnJvcjogJyArIGVycik7IH0gfSB9IH0gfSB9XG5cdFx0cmV0dXJuIEVRO1xuXHR9XG5cblx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdCdDb21wYXJpc29uIGVycm9yOiBjb21wYXJpc29uIGlzIG9ubHkgZGVmaW5lZCBvbiBpbnRzLCAnXG5cdFx0KyAnZmxvYXRzLCB0aW1lcywgY2hhcnMsIHN0cmluZ3MsIGxpc3RzIG9mIGNvbXBhcmFibGUgdmFsdWVzLCAnXG5cdFx0KyAnYW5kIHR1cGxlcyBvZiBjb21wYXJhYmxlIHZhbHVlcy4nXG5cdCk7XG59XG5cblxuLy8gQ09NTU9OIFZBTFVFU1xuXG52YXIgVHVwbGUwID0ge1xuXHRjdG9yOiAnX1R1cGxlMCdcbn07XG5cbmZ1bmN0aW9uIFR1cGxlMih4LCB5KVxue1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRfMDogeCxcblx0XHRfMTogeVxuXHR9O1xufVxuXG5mdW5jdGlvbiBjaHIoYylcbntcblx0cmV0dXJuIG5ldyBTdHJpbmcoYyk7XG59XG5cblxuLy8gR1VJRFxuXG52YXIgY291bnQgPSAwO1xuZnVuY3Rpb24gZ3VpZChfKVxue1xuXHRyZXR1cm4gY291bnQrKztcbn1cblxuXG4vLyBSRUNPUkRTXG5cbmZ1bmN0aW9uIHVwZGF0ZShvbGRSZWNvcmQsIHVwZGF0ZWRGaWVsZHMpXG57XG5cdHZhciBuZXdSZWNvcmQgPSB7fTtcblx0Zm9yICh2YXIga2V5IGluIG9sZFJlY29yZClcblx0e1xuXHRcdHZhciB2YWx1ZSA9IChrZXkgaW4gdXBkYXRlZEZpZWxkcykgPyB1cGRhdGVkRmllbGRzW2tleV0gOiBvbGRSZWNvcmRba2V5XTtcblx0XHRuZXdSZWNvcmRba2V5XSA9IHZhbHVlO1xuXHR9XG5cdHJldHVybiBuZXdSZWNvcmQ7XG59XG5cblxuLy8vLyBMSVNUIFNUVUZGIC8vLy9cblxudmFyIE5pbCA9IHsgY3RvcjogJ1tdJyB9O1xuXG5mdW5jdGlvbiBDb25zKGhkLCB0bClcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnOjonLFxuXHRcdF8wOiBoZCxcblx0XHRfMTogdGxcblx0fTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kKHhzLCB5cylcbntcblx0Ly8gYXBwZW5kIFN0cmluZ3Ncblx0aWYgKHR5cGVvZiB4cyA9PT0gJ3N0cmluZycpXG5cdHtcblx0XHRyZXR1cm4geHMgKyB5cztcblx0fVxuXG5cdC8vIGFwcGVuZCBMaXN0c1xuXHRpZiAoeHMuY3RvciA9PT0gJ1tdJylcblx0e1xuXHRcdHJldHVybiB5cztcblx0fVxuXHR2YXIgcm9vdCA9IENvbnMoeHMuXzAsIE5pbCk7XG5cdHZhciBjdXJyID0gcm9vdDtcblx0eHMgPSB4cy5fMTtcblx0d2hpbGUgKHhzLmN0b3IgIT09ICdbXScpXG5cdHtcblx0XHRjdXJyLl8xID0gQ29ucyh4cy5fMCwgTmlsKTtcblx0XHR4cyA9IHhzLl8xO1xuXHRcdGN1cnIgPSBjdXJyLl8xO1xuXHR9XG5cdGN1cnIuXzEgPSB5cztcblx0cmV0dXJuIHJvb3Q7XG59XG5cblxuLy8gQ1JBU0hFU1xuXG5mdW5jdGlvbiBjcmFzaChtb2R1bGVOYW1lLCByZWdpb24pXG57XG5cdHJldHVybiBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0J1JhbiBpbnRvIGEgYERlYnVnLmNyYXNoYCBpbiBtb2R1bGUgYCcgKyBtb2R1bGVOYW1lICsgJ2AgJyArIHJlZ2lvblRvU3RyaW5nKHJlZ2lvbikgKyAnXFxuJ1xuXHRcdFx0KyAnVGhlIG1lc3NhZ2UgcHJvdmlkZWQgYnkgdGhlIGNvZGUgYXV0aG9yIGlzOlxcblxcbiAgICAnXG5cdFx0XHQrIG1lc3NhZ2Vcblx0XHQpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBjcmFzaENhc2UobW9kdWxlTmFtZSwgcmVnaW9uLCB2YWx1ZSlcbntcblx0cmV0dXJuIGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHQnUmFuIGludG8gYSBgRGVidWcuY3Jhc2hgIGluIG1vZHVsZSBgJyArIG1vZHVsZU5hbWUgKyAnYFxcblxcbidcblx0XHRcdCsgJ1RoaXMgd2FzIGNhdXNlZCBieSB0aGUgYGNhc2VgIGV4cHJlc3Npb24gJyArIHJlZ2lvblRvU3RyaW5nKHJlZ2lvbikgKyAnLlxcbidcblx0XHRcdCsgJ09uZSBvZiB0aGUgYnJhbmNoZXMgZW5kZWQgd2l0aCBhIGNyYXNoIGFuZCB0aGUgZm9sbG93aW5nIHZhbHVlIGdvdCB0aHJvdWdoOlxcblxcbiAgICAnICsgdG9TdHJpbmcodmFsdWUpICsgJ1xcblxcbidcblx0XHRcdCsgJ1RoZSBtZXNzYWdlIHByb3ZpZGVkIGJ5IHRoZSBjb2RlIGF1dGhvciBpczpcXG5cXG4gICAgJ1xuXHRcdFx0KyBtZXNzYWdlXG5cdFx0KTtcblx0fTtcbn1cblxuZnVuY3Rpb24gcmVnaW9uVG9TdHJpbmcocmVnaW9uKVxue1xuXHRpZiAocmVnaW9uLnN0YXJ0LmxpbmUgPT0gcmVnaW9uLmVuZC5saW5lKVxuXHR7XG5cdFx0cmV0dXJuICdvbiBsaW5lICcgKyByZWdpb24uc3RhcnQubGluZTtcblx0fVxuXHRyZXR1cm4gJ2JldHdlZW4gbGluZXMgJyArIHJlZ2lvbi5zdGFydC5saW5lICsgJyBhbmQgJyArIHJlZ2lvbi5lbmQubGluZTtcbn1cblxuXG4vLyBUTyBTVFJJTkdcblxuZnVuY3Rpb24gdG9TdHJpbmcodilcbntcblx0dmFyIHR5cGUgPSB0eXBlb2Ygdjtcblx0aWYgKHR5cGUgPT09ICdmdW5jdGlvbicpXG5cdHtcblx0XHR2YXIgbmFtZSA9IHYuZnVuYyA/IHYuZnVuYy5uYW1lIDogdi5uYW1lO1xuXHRcdHJldHVybiAnPGZ1bmN0aW9uJyArIChuYW1lID09PSAnJyA/ICcnIDogJzonKSArIG5hbWUgKyAnPic7XG5cdH1cblxuXHRpZiAodHlwZSA9PT0gJ2Jvb2xlYW4nKVxuXHR7XG5cdFx0cmV0dXJuIHYgPyAnVHJ1ZScgOiAnRmFsc2UnO1xuXHR9XG5cblx0aWYgKHR5cGUgPT09ICdudW1iZXInKVxuXHR7XG5cdFx0cmV0dXJuIHYgKyAnJztcblx0fVxuXG5cdGlmICh2IGluc3RhbmNlb2YgU3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuICdcXCcnICsgYWRkU2xhc2hlcyh2LCB0cnVlKSArICdcXCcnO1xuXHR9XG5cblx0aWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuXHR7XG5cdFx0cmV0dXJuICdcIicgKyBhZGRTbGFzaGVzKHYsIGZhbHNlKSArICdcIic7XG5cdH1cblxuXHRpZiAodiA9PT0gbnVsbClcblx0e1xuXHRcdHJldHVybiAnbnVsbCc7XG5cdH1cblxuXHRpZiAodHlwZSA9PT0gJ29iamVjdCcgJiYgJ2N0b3InIGluIHYpXG5cdHtcblx0XHR2YXIgY3RvclN0YXJ0ZXIgPSB2LmN0b3Iuc3Vic3RyaW5nKDAsIDUpO1xuXG5cdFx0aWYgKGN0b3JTdGFydGVyID09PSAnX1R1cGwnKVxuXHRcdHtcblx0XHRcdHZhciBvdXRwdXQgPSBbXTtcblx0XHRcdGZvciAodmFyIGsgaW4gdilcblx0XHRcdHtcblx0XHRcdFx0aWYgKGsgPT09ICdjdG9yJykgY29udGludWU7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHRvU3RyaW5nKHZba10pKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAnKCcgKyBvdXRwdXQuam9pbignLCcpICsgJyknO1xuXHRcdH1cblxuXHRcdGlmIChjdG9yU3RhcnRlciA9PT0gJ19UYXNrJylcblx0XHR7XG5cdFx0XHRyZXR1cm4gJzx0YXNrPidcblx0XHR9XG5cblx0XHRpZiAodi5jdG9yID09PSAnX0FycmF5Jylcblx0XHR7XG5cdFx0XHR2YXIgbGlzdCA9IF9lbG1fbGFuZyRjb3JlJEFycmF5JHRvTGlzdCh2KTtcblx0XHRcdHJldHVybiAnQXJyYXkuZnJvbUxpc3QgJyArIHRvU3RyaW5nKGxpc3QpO1xuXHRcdH1cblxuXHRcdGlmICh2LmN0b3IgPT09ICc8ZGVjb2Rlcj4nKVxuXHRcdHtcblx0XHRcdHJldHVybiAnPGRlY29kZXI+Jztcblx0XHR9XG5cblx0XHRpZiAodi5jdG9yID09PSAnX1Byb2Nlc3MnKVxuXHRcdHtcblx0XHRcdHJldHVybiAnPHByb2Nlc3M6JyArIHYuaWQgKyAnPic7XG5cdFx0fVxuXG5cdFx0aWYgKHYuY3RvciA9PT0gJzo6Jylcblx0XHR7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJ1snICsgdG9TdHJpbmcodi5fMCk7XG5cdFx0XHR2ID0gdi5fMTtcblx0XHRcdHdoaWxlICh2LmN0b3IgPT09ICc6OicpXG5cdFx0XHR7XG5cdFx0XHRcdG91dHB1dCArPSAnLCcgKyB0b1N0cmluZyh2Ll8wKTtcblx0XHRcdFx0diA9IHYuXzE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb3V0cHV0ICsgJ10nO1xuXHRcdH1cblxuXHRcdGlmICh2LmN0b3IgPT09ICdbXScpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICdbXSc7XG5cdFx0fVxuXG5cdFx0aWYgKHYuY3RvciA9PT0gJ1NldF9lbG1fYnVpbHRpbicpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICdTZXQuZnJvbUxpc3QgJyArIHRvU3RyaW5nKF9lbG1fbGFuZyRjb3JlJFNldCR0b0xpc3QodikpO1xuXHRcdH1cblxuXHRcdGlmICh2LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nIHx8IHYuY3RvciA9PT0gJ1JCRW1wdHlfZWxtX2J1aWx0aW4nKVxuXHRcdHtcblx0XHRcdHJldHVybiAnRGljdC5mcm9tTGlzdCAnICsgdG9TdHJpbmcoX2VsbV9sYW5nJGNvcmUkRGljdCR0b0xpc3QodikpO1xuXHRcdH1cblxuXHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHRmb3IgKHZhciBpIGluIHYpXG5cdFx0e1xuXHRcdFx0aWYgKGkgPT09ICdjdG9yJykgY29udGludWU7XG5cdFx0XHR2YXIgc3RyID0gdG9TdHJpbmcodltpXSk7XG5cdFx0XHR2YXIgYzAgPSBzdHJbMF07XG5cdFx0XHR2YXIgcGFyZW5sZXNzID0gYzAgPT09ICd7JyB8fCBjMCA9PT0gJygnIHx8IGMwID09PSAnPCcgfHwgYzAgPT09ICdcIicgfHwgc3RyLmluZGV4T2YoJyAnKSA8IDA7XG5cdFx0XHRvdXRwdXQgKz0gJyAnICsgKHBhcmVubGVzcyA/IHN0ciA6ICcoJyArIHN0ciArICcpJyk7XG5cdFx0fVxuXHRcdHJldHVybiB2LmN0b3IgKyBvdXRwdXQ7XG5cdH1cblxuXHRpZiAodHlwZSA9PT0gJ29iamVjdCcpXG5cdHtcblx0XHRpZiAodiBpbnN0YW5jZW9mIERhdGUpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICc8JyArIHYudG9TdHJpbmcoKSArICc+Jztcblx0XHR9XG5cblx0XHRpZiAodi5lbG1fd2ViX3NvY2tldClcblx0XHR7XG5cdFx0XHRyZXR1cm4gJzx3ZWJzb2NrZXQ+Jztcblx0XHR9XG5cblx0XHR2YXIgb3V0cHV0ID0gW107XG5cdFx0Zm9yICh2YXIgayBpbiB2KVxuXHRcdHtcblx0XHRcdG91dHB1dC5wdXNoKGsgKyAnID0gJyArIHRvU3RyaW5nKHZba10pKTtcblx0XHR9XG5cdFx0aWYgKG91dHB1dC5sZW5ndGggPT09IDApXG5cdFx0e1xuXHRcdFx0cmV0dXJuICd7fSc7XG5cdFx0fVxuXHRcdHJldHVybiAneyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnIH0nO1xuXHR9XG5cblx0cmV0dXJuICc8aW50ZXJuYWwgc3RydWN0dXJlPic7XG59XG5cbmZ1bmN0aW9uIGFkZFNsYXNoZXMoc3RyLCBpc0NoYXIpXG57XG5cdHZhciBzID0gc3RyLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcblx0XHRcdCAgLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKVxuXHRcdFx0ICAucmVwbGFjZSgvXFx0L2csICdcXFxcdCcpXG5cdFx0XHQgIC5yZXBsYWNlKC9cXHIvZywgJ1xcXFxyJylcblx0XHRcdCAgLnJlcGxhY2UoL1xcdi9nLCAnXFxcXHYnKVxuXHRcdFx0ICAucmVwbGFjZSgvXFwwL2csICdcXFxcMCcpO1xuXHRpZiAoaXNDaGFyKVxuXHR7XG5cdFx0cmV0dXJuIHMucmVwbGFjZSgvXFwnL2csICdcXFxcXFwnJyk7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0cmV0dXJuIHMucmVwbGFjZSgvXFxcIi9nLCAnXFxcXFwiJyk7XG5cdH1cbn1cblxuXG5yZXR1cm4ge1xuXHRlcTogZXEsXG5cdGNtcDogY21wLFxuXHRUdXBsZTA6IFR1cGxlMCxcblx0VHVwbGUyOiBUdXBsZTIsXG5cdGNocjogY2hyLFxuXHR1cGRhdGU6IHVwZGF0ZSxcblx0Z3VpZDogZ3VpZCxcblxuXHRhcHBlbmQ6IEYyKGFwcGVuZCksXG5cblx0Y3Jhc2g6IGNyYXNoLFxuXHRjcmFzaENhc2U6IGNyYXNoQ2FzZSxcblxuXHR0b1N0cmluZzogdG9TdHJpbmdcbn07XG5cbn0oKTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkdW5jdXJyeSA9IEYyKFxuXHRmdW5jdGlvbiAoZiwgX3AwKSB7XG5cdFx0dmFyIF9wMSA9IF9wMDtcblx0XHRyZXR1cm4gQTIoZiwgX3AxLl8wLCBfcDEuXzEpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkY3VycnkgPSBGMyhcblx0ZnVuY3Rpb24gKGYsIGEsIGIpIHtcblx0XHRyZXR1cm4gZihcblx0XHRcdHtjdG9yOiAnX1R1cGxlMicsIF8wOiBhLCBfMTogYn0pO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkZmxpcCA9IEYzKFxuXHRmdW5jdGlvbiAoZiwgYiwgYSkge1xuXHRcdHJldHVybiBBMihmLCBhLCBiKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJHNuZCA9IGZ1bmN0aW9uIChfcDIpIHtcblx0dmFyIF9wMyA9IF9wMjtcblx0cmV0dXJuIF9wMy5fMTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGZzdCA9IGZ1bmN0aW9uIChfcDQpIHtcblx0dmFyIF9wNSA9IF9wNDtcblx0cmV0dXJuIF9wNS5fMDtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGFsd2F5cyA9IEYyKFxuXHRmdW5jdGlvbiAoYSwgX3A2KSB7XG5cdFx0cmV0dXJuIGE7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRpZGVudGl0eSA9IGZ1bmN0aW9uICh4KSB7XG5cdHJldHVybiB4O1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHNbJzx8J10gPSBGMihcblx0ZnVuY3Rpb24gKGYsIHgpIHtcblx0XHRyZXR1cm4gZih4KTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWyd8PiddID0gRjIoXG5cdGZ1bmN0aW9uICh4LCBmKSB7XG5cdFx0cmV0dXJuIGYoeCk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snPj4nXSA9IEYzKFxuXHRmdW5jdGlvbiAoZiwgZywgeCkge1xuXHRcdHJldHVybiBnKFxuXHRcdFx0Zih4KSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snPDwnXSA9IEYzKFxuXHRmdW5jdGlvbiAoZywgZiwgeCkge1xuXHRcdHJldHVybiBnKFxuXHRcdFx0Zih4KSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snKysnXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5hcHBlbmQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJHRvU3RyaW5nID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLnRvU3RyaW5nO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRpc0luZmluaXRlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5pc0luZmluaXRlO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRpc05hTiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuaXNOYU47XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJHRvRmxvYXQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLnRvRmxvYXQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGNlaWxpbmcgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmNlaWxpbmc7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGZsb29yID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5mbG9vcjtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkdHJ1bmNhdGUgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLnRydW5jYXRlO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRyb3VuZCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3Mucm91bmQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJG5vdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3Mubm90O1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyR4b3IgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLnhvcjtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHNbJ3x8J10gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLm9yO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snJiYnXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuYW5kO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRtYXggPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLm1heDtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkbWluID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5taW47XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGNvbXBhcmUgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmNvbXBhcmU7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWyc+PSddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5nZTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHNbJzw9J10gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmxlO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snPiddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5ndDtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHNbJzwnXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MubHQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWycvPSddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5uZXE7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWyc9PSddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5lcTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkZSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuZTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkcGkgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLnBpO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRjbGFtcCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuY2xhbXA7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGxvZ0Jhc2UgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmxvZ0Jhc2U7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGFicyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuYWJzO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRuZWdhdGUgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLm5lZ2F0ZTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Mkc3FydCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3Muc3FydDtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkYXRhbjIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmF0YW4yO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRhdGFuID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5hdGFuO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRhc2luID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5hc2luO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRhY29zID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5hY29zO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyR0YW4gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLnRhbjtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Mkc2luID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5zaW47XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGNvcyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuY29zO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snXiddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5leHA7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWyclJ10gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLm1vZDtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkcmVtID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5yZW07XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWycvLyddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5kaXY7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWycvJ10gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmZsb2F0RGl2O1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snKiddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5tdWw7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWyctJ10gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLnN1YjtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHNbJysnXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuYWRkO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyR0b1BvbGFyID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy50b1BvbGFyO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRmcm9tUG9sYXIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmZyb21Qb2xhcjtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkdHVybnMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLnR1cm5zO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRkZWdyZWVzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5kZWdyZWVzO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRyYWRpYW5zID0gZnVuY3Rpb24gKHQpIHtcblx0cmV0dXJuIHQ7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRHVCA9IHtjdG9yOiAnR1QnfTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkRVEgPSB7Y3RvcjogJ0VRJ307XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJExUID0ge2N0b3I6ICdMVCd9O1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyROZXZlciA9IGZ1bmN0aW9uIChhKSB7XG5cdHJldHVybiB7Y3RvcjogJ05ldmVyJywgXzA6IGF9O1xufTtcblxudmFyIF9lbG1fbGFuZyRjb3JlJE1heWJlJHdpdGhEZWZhdWx0ID0gRjIoXG5cdGZ1bmN0aW9uICgkZGVmYXVsdCwgbWF5YmUpIHtcblx0XHR2YXIgX3AwID0gbWF5YmU7XG5cdFx0aWYgKF9wMC5jdG9yID09PSAnSnVzdCcpIHtcblx0XHRcdHJldHVybiBfcDAuXzA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAkZGVmYXVsdDtcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmcgPSB7Y3RvcjogJ05vdGhpbmcnfTtcbnZhciBfZWxtX2xhbmckY29yZSRNYXliZSRvbmVPZiA9IGZ1bmN0aW9uIChtYXliZXMpIHtcblx0b25lT2Y6XG5cdHdoaWxlICh0cnVlKSB7XG5cdFx0dmFyIF9wMSA9IG1heWJlcztcblx0XHRpZiAoX3AxLmN0b3IgPT09ICdbXScpIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgX3AzID0gX3AxLl8wO1xuXHRcdFx0dmFyIF9wMiA9IF9wMztcblx0XHRcdGlmIChfcDIuY3RvciA9PT0gJ05vdGhpbmcnKSB7XG5cdFx0XHRcdHZhciBfdjMgPSBfcDEuXzE7XG5cdFx0XHRcdG1heWJlcyA9IF92Mztcblx0XHRcdFx0Y29udGludWUgb25lT2Y7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gX3AzO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcbnZhciBfZWxtX2xhbmckY29yZSRNYXliZSRhbmRUaGVuID0gRjIoXG5cdGZ1bmN0aW9uIChtYXliZVZhbHVlLCBjYWxsYmFjaykge1xuXHRcdHZhciBfcDQgPSBtYXliZVZhbHVlO1xuXHRcdGlmIChfcDQuY3RvciA9PT0gJ0p1c3QnKSB7XG5cdFx0XHRyZXR1cm4gY2FsbGJhY2soX3A0Ll8wKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmc7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0ID0gZnVuY3Rpb24gKGEpIHtcblx0cmV0dXJuIHtjdG9yOiAnSnVzdCcsIF8wOiBhfTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkTWF5YmUkbWFwID0gRjIoXG5cdGZ1bmN0aW9uIChmLCBtYXliZSkge1xuXHRcdHZhciBfcDUgPSBtYXliZTtcblx0XHRpZiAoX3A1LmN0b3IgPT09ICdKdXN0Jykge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QoXG5cdFx0XHRcdGYoX3A1Ll8wKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTWF5YmUkbWFwMiA9IEYzKFxuXHRmdW5jdGlvbiAoZnVuYywgbWEsIG1iKSB7XG5cdFx0dmFyIF9wNiA9IHtjdG9yOiAnX1R1cGxlMicsIF8wOiBtYSwgXzE6IG1ifTtcblx0XHRpZiAoKChfcDYuY3RvciA9PT0gJ19UdXBsZTInKSAmJiAoX3A2Ll8wLmN0b3IgPT09ICdKdXN0JykpICYmIChfcDYuXzEuY3RvciA9PT0gJ0p1c3QnKSkge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QoXG5cdFx0XHRcdEEyKGZ1bmMsIF9wNi5fMC5fMCwgX3A2Ll8xLl8wKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTWF5YmUkbWFwMyA9IEY0KFxuXHRmdW5jdGlvbiAoZnVuYywgbWEsIG1iLCBtYykge1xuXHRcdHZhciBfcDcgPSB7Y3RvcjogJ19UdXBsZTMnLCBfMDogbWEsIF8xOiBtYiwgXzI6IG1jfTtcblx0XHRpZiAoKCgoX3A3LmN0b3IgPT09ICdfVHVwbGUzJykgJiYgKF9wNy5fMC5jdG9yID09PSAnSnVzdCcpKSAmJiAoX3A3Ll8xLmN0b3IgPT09ICdKdXN0JykpICYmIChfcDcuXzIuY3RvciA9PT0gJ0p1c3QnKSkge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QoXG5cdFx0XHRcdEEzKGZ1bmMsIF9wNy5fMC5fMCwgX3A3Ll8xLl8wLCBfcDcuXzIuXzApKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmc7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRNYXliZSRtYXA0ID0gRjUoXG5cdGZ1bmN0aW9uIChmdW5jLCBtYSwgbWIsIG1jLCBtZCkge1xuXHRcdHZhciBfcDggPSB7Y3RvcjogJ19UdXBsZTQnLCBfMDogbWEsIF8xOiBtYiwgXzI6IG1jLCBfMzogbWR9O1xuXHRcdGlmICgoKCgoX3A4LmN0b3IgPT09ICdfVHVwbGU0JykgJiYgKF9wOC5fMC5jdG9yID09PSAnSnVzdCcpKSAmJiAoX3A4Ll8xLmN0b3IgPT09ICdKdXN0JykpICYmIChfcDguXzIuY3RvciA9PT0gJ0p1c3QnKSkgJiYgKF9wOC5fMy5jdG9yID09PSAnSnVzdCcpKSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkSnVzdChcblx0XHRcdFx0QTQoZnVuYywgX3A4Ll8wLl8wLCBfcDguXzEuXzAsIF9wOC5fMi5fMCwgX3A4Ll8zLl8wKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTWF5YmUkbWFwNSA9IEY2KFxuXHRmdW5jdGlvbiAoZnVuYywgbWEsIG1iLCBtYywgbWQsIG1lKSB7XG5cdFx0dmFyIF9wOSA9IHtjdG9yOiAnX1R1cGxlNScsIF8wOiBtYSwgXzE6IG1iLCBfMjogbWMsIF8zOiBtZCwgXzQ6IG1lfTtcblx0XHRpZiAoKCgoKChfcDkuY3RvciA9PT0gJ19UdXBsZTUnKSAmJiAoX3A5Ll8wLmN0b3IgPT09ICdKdXN0JykpICYmIChfcDkuXzEuY3RvciA9PT0gJ0p1c3QnKSkgJiYgKF9wOS5fMi5jdG9yID09PSAnSnVzdCcpKSAmJiAoX3A5Ll8zLmN0b3IgPT09ICdKdXN0JykpICYmIChfcDkuXzQuY3RvciA9PT0gJ0p1c3QnKSkge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QoXG5cdFx0XHRcdEE1KGZ1bmMsIF9wOS5fMC5fMCwgX3A5Ll8xLl8wLCBfcDkuXzIuXzAsIF9wOS5fMy5fMCwgX3A5Ll80Ll8wKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHRcdH1cblx0fSk7XG5cbi8vaW1wb3J0IE5hdGl2ZS5VdGlscyAvL1xuXG52YXIgX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QgPSBmdW5jdGlvbigpIHtcblxudmFyIE5pbCA9IHsgY3RvcjogJ1tdJyB9O1xuXG5mdW5jdGlvbiBDb25zKGhkLCB0bClcbntcblx0cmV0dXJuIHsgY3RvcjogJzo6JywgXzA6IGhkLCBfMTogdGwgfTtcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5KGFycilcbntcblx0dmFyIG91dCA9IE5pbDtcblx0Zm9yICh2YXIgaSA9IGFyci5sZW5ndGg7IGktLTsgKVxuXHR7XG5cdFx0b3V0ID0gQ29ucyhhcnJbaV0sIG91dCk7XG5cdH1cblx0cmV0dXJuIG91dDtcbn1cblxuZnVuY3Rpb24gdG9BcnJheSh4cylcbntcblx0dmFyIG91dCA9IFtdO1xuXHR3aGlsZSAoeHMuY3RvciAhPT0gJ1tdJylcblx0e1xuXHRcdG91dC5wdXNoKHhzLl8wKTtcblx0XHR4cyA9IHhzLl8xO1xuXHR9XG5cdHJldHVybiBvdXQ7XG59XG5cblxuZnVuY3Rpb24gcmFuZ2UobG8sIGhpKVxue1xuXHR2YXIgbGlzdCA9IE5pbDtcblx0aWYgKGxvIDw9IGhpKVxuXHR7XG5cdFx0ZG9cblx0XHR7XG5cdFx0XHRsaXN0ID0gQ29ucyhoaSwgbGlzdCk7XG5cdFx0fVxuXHRcdHdoaWxlIChoaS0tID4gbG8pO1xuXHR9XG5cdHJldHVybiBsaXN0O1xufVxuXG5mdW5jdGlvbiBmb2xkcihmLCBiLCB4cylcbntcblx0dmFyIGFyciA9IHRvQXJyYXkoeHMpO1xuXHR2YXIgYWNjID0gYjtcblx0Zm9yICh2YXIgaSA9IGFyci5sZW5ndGg7IGktLTsgKVxuXHR7XG5cdFx0YWNjID0gQTIoZiwgYXJyW2ldLCBhY2MpO1xuXHR9XG5cdHJldHVybiBhY2M7XG59XG5cbmZ1bmN0aW9uIG1hcDIoZiwgeHMsIHlzKVxue1xuXHR2YXIgYXJyID0gW107XG5cdHdoaWxlICh4cy5jdG9yICE9PSAnW10nICYmIHlzLmN0b3IgIT09ICdbXScpXG5cdHtcblx0XHRhcnIucHVzaChBMihmLCB4cy5fMCwgeXMuXzApKTtcblx0XHR4cyA9IHhzLl8xO1xuXHRcdHlzID0geXMuXzE7XG5cdH1cblx0cmV0dXJuIGZyb21BcnJheShhcnIpO1xufVxuXG5mdW5jdGlvbiBtYXAzKGYsIHhzLCB5cywgenMpXG57XG5cdHZhciBhcnIgPSBbXTtcblx0d2hpbGUgKHhzLmN0b3IgIT09ICdbXScgJiYgeXMuY3RvciAhPT0gJ1tdJyAmJiB6cy5jdG9yICE9PSAnW10nKVxuXHR7XG5cdFx0YXJyLnB1c2goQTMoZiwgeHMuXzAsIHlzLl8wLCB6cy5fMCkpO1xuXHRcdHhzID0geHMuXzE7XG5cdFx0eXMgPSB5cy5fMTtcblx0XHR6cyA9IHpzLl8xO1xuXHR9XG5cdHJldHVybiBmcm9tQXJyYXkoYXJyKTtcbn1cblxuZnVuY3Rpb24gbWFwNChmLCB3cywgeHMsIHlzLCB6cylcbntcblx0dmFyIGFyciA9IFtdO1xuXHR3aGlsZSAoICAgd3MuY3RvciAhPT0gJ1tdJ1xuXHRcdCAgICYmIHhzLmN0b3IgIT09ICdbXSdcblx0XHQgICAmJiB5cy5jdG9yICE9PSAnW10nXG5cdFx0ICAgJiYgenMuY3RvciAhPT0gJ1tdJylcblx0e1xuXHRcdGFyci5wdXNoKEE0KGYsIHdzLl8wLCB4cy5fMCwgeXMuXzAsIHpzLl8wKSk7XG5cdFx0d3MgPSB3cy5fMTtcblx0XHR4cyA9IHhzLl8xO1xuXHRcdHlzID0geXMuXzE7XG5cdFx0enMgPSB6cy5fMTtcblx0fVxuXHRyZXR1cm4gZnJvbUFycmF5KGFycik7XG59XG5cbmZ1bmN0aW9uIG1hcDUoZiwgdnMsIHdzLCB4cywgeXMsIHpzKVxue1xuXHR2YXIgYXJyID0gW107XG5cdHdoaWxlICggICB2cy5jdG9yICE9PSAnW10nXG5cdFx0ICAgJiYgd3MuY3RvciAhPT0gJ1tdJ1xuXHRcdCAgICYmIHhzLmN0b3IgIT09ICdbXSdcblx0XHQgICAmJiB5cy5jdG9yICE9PSAnW10nXG5cdFx0ICAgJiYgenMuY3RvciAhPT0gJ1tdJylcblx0e1xuXHRcdGFyci5wdXNoKEE1KGYsIHZzLl8wLCB3cy5fMCwgeHMuXzAsIHlzLl8wLCB6cy5fMCkpO1xuXHRcdHZzID0gdnMuXzE7XG5cdFx0d3MgPSB3cy5fMTtcblx0XHR4cyA9IHhzLl8xO1xuXHRcdHlzID0geXMuXzE7XG5cdFx0enMgPSB6cy5fMTtcblx0fVxuXHRyZXR1cm4gZnJvbUFycmF5KGFycik7XG59XG5cbmZ1bmN0aW9uIHNvcnRCeShmLCB4cylcbntcblx0cmV0dXJuIGZyb21BcnJheSh0b0FycmF5KHhzKS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNtcChmKGEpLCBmKGIpKTtcblx0fSkpO1xufVxuXG5mdW5jdGlvbiBzb3J0V2l0aChmLCB4cylcbntcblx0cmV0dXJuIGZyb21BcnJheSh0b0FycmF5KHhzKS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcblx0XHR2YXIgb3JkID0gZihhKShiKS5jdG9yO1xuXHRcdHJldHVybiBvcmQgPT09ICdFUScgPyAwIDogb3JkID09PSAnTFQnID8gLTEgOiAxO1xuXHR9KSk7XG59XG5cbnJldHVybiB7XG5cdE5pbDogTmlsLFxuXHRDb25zOiBDb25zLFxuXHRjb25zOiBGMihDb25zKSxcblx0dG9BcnJheTogdG9BcnJheSxcblx0ZnJvbUFycmF5OiBmcm9tQXJyYXksXG5cdHJhbmdlOiByYW5nZSxcblxuXHRmb2xkcjogRjMoZm9sZHIpLFxuXG5cdG1hcDI6IEYzKG1hcDIpLFxuXHRtYXAzOiBGNChtYXAzKSxcblx0bWFwNDogRjUobWFwNCksXG5cdG1hcDU6IEY2KG1hcDUpLFxuXHRzb3J0Qnk6IEYyKHNvcnRCeSksXG5cdHNvcnRXaXRoOiBGMihzb3J0V2l0aClcbn07XG5cbn0oKTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JHNvcnRXaXRoID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3Quc29ydFdpdGg7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRzb3J0QnkgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5zb3J0Qnk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRzb3J0ID0gZnVuY3Rpb24gKHhzKSB7XG5cdHJldHVybiBBMihfZWxtX2xhbmckY29yZSRMaXN0JHNvcnRCeSwgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGlkZW50aXR5LCB4cyk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkZHJvcCA9IEYyKFxuXHRmdW5jdGlvbiAobiwgbGlzdCkge1xuXHRcdGRyb3A6XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGlmIChfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY21wKG4sIDApIDwgMSkge1xuXHRcdFx0XHRyZXR1cm4gbGlzdDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBfcDAgPSBsaXN0O1xuXHRcdFx0XHRpZiAoX3AwLmN0b3IgPT09ICdbXScpIHtcblx0XHRcdFx0XHRyZXR1cm4gbGlzdDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YXIgX3YxID0gbiAtIDEsXG5cdFx0XHRcdFx0XHRfdjIgPSBfcDAuXzE7XG5cdFx0XHRcdFx0biA9IF92MTtcblx0XHRcdFx0XHRsaXN0ID0gX3YyO1xuXHRcdFx0XHRcdGNvbnRpbnVlIGRyb3A7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkbWFwNSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0Lm1hcDU7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRtYXA0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QubWFwNDtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JG1hcDMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5tYXAzO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkbWFwMiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0Lm1hcDI7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRhbnkgPSBGMihcblx0ZnVuY3Rpb24gKGlzT2theSwgbGlzdCkge1xuXHRcdGFueTpcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0dmFyIF9wMSA9IGxpc3Q7XG5cdFx0XHRpZiAoX3AxLmN0b3IgPT09ICdbXScpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aWYgKGlzT2theShfcDEuXzApKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFyIF92NCA9IGlzT2theSxcblx0XHRcdFx0XHRcdF92NSA9IF9wMS5fMTtcblx0XHRcdFx0XHRpc09rYXkgPSBfdjQ7XG5cdFx0XHRcdFx0bGlzdCA9IF92NTtcblx0XHRcdFx0XHRjb250aW51ZSBhbnk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkYWxsID0gRjIoXG5cdGZ1bmN0aW9uIChpc09rYXksIGxpc3QpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkQmFzaWNzJG5vdChcblx0XHRcdEEyKFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGFueSxcblx0XHRcdFx0ZnVuY3Rpb24gKF9wMikge1xuXHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRCYXNpY3Mkbm90KFxuXHRcdFx0XHRcdFx0aXNPa2F5KF9wMikpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRsaXN0KSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZHIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mb2xkcjtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JGZvbGRsID0gRjMoXG5cdGZ1bmN0aW9uIChmdW5jLCBhY2MsIGxpc3QpIHtcblx0XHRmb2xkbDpcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0dmFyIF9wMyA9IGxpc3Q7XG5cdFx0XHRpZiAoX3AzLmN0b3IgPT09ICdbXScpIHtcblx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBfdjcgPSBmdW5jLFxuXHRcdFx0XHRcdF92OCA9IEEyKGZ1bmMsIF9wMy5fMCwgYWNjKSxcblx0XHRcdFx0XHRfdjkgPSBfcDMuXzE7XG5cdFx0XHRcdGZ1bmMgPSBfdjc7XG5cdFx0XHRcdGFjYyA9IF92ODtcblx0XHRcdFx0bGlzdCA9IF92OTtcblx0XHRcdFx0Y29udGludWUgZm9sZGw7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JGxlbmd0aCA9IGZ1bmN0aW9uICh4cykge1xuXHRyZXR1cm4gQTMoXG5cdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkbCxcblx0XHRGMihcblx0XHRcdGZ1bmN0aW9uIChfcDQsIGkpIHtcblx0XHRcdFx0cmV0dXJuIGkgKyAxO1xuXHRcdFx0fSksXG5cdFx0MCxcblx0XHR4cyk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3Qkc3VtID0gZnVuY3Rpb24gKG51bWJlcnMpIHtcblx0cmV0dXJuIEEzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZGwsXG5cdFx0RjIoXG5cdFx0XHRmdW5jdGlvbiAoeCwgeSkge1xuXHRcdFx0XHRyZXR1cm4geCArIHk7XG5cdFx0XHR9KSxcblx0XHQwLFxuXHRcdG51bWJlcnMpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JHByb2R1Y3QgPSBmdW5jdGlvbiAobnVtYmVycykge1xuXHRyZXR1cm4gQTMoXG5cdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkbCxcblx0XHRGMihcblx0XHRcdGZ1bmN0aW9uICh4LCB5KSB7XG5cdFx0XHRcdHJldHVybiB4ICogeTtcblx0XHRcdH0pLFxuXHRcdDEsXG5cdFx0bnVtYmVycyk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkbWF4aW11bSA9IGZ1bmN0aW9uIChsaXN0KSB7XG5cdHZhciBfcDUgPSBsaXN0O1xuXHRpZiAoX3A1LmN0b3IgPT09ICc6OicpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkSnVzdChcblx0XHRcdEEzKF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZGwsIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRtYXgsIF9wNS5fMCwgX3A1Ll8xKSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmc7XG5cdH1cbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRtaW5pbXVtID0gZnVuY3Rpb24gKGxpc3QpIHtcblx0dmFyIF9wNiA9IGxpc3Q7XG5cdGlmIChfcDYuY3RvciA9PT0gJzo6Jykge1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0KFxuXHRcdFx0QTMoX2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkbCwgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJG1pbiwgX3A2Ll8wLCBfcDYuXzEpKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZztcblx0fVxufTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JGluZGV4ZWRNYXAgPSBGMihcblx0ZnVuY3Rpb24gKGYsIHhzKSB7XG5cdFx0cmV0dXJuIEEzKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRtYXAyLFxuXHRcdFx0Zixcblx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LnJhbmdlKFxuXHRcdFx0XHQwLFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGxlbmd0aCh4cykgLSAxKSxcblx0XHRcdHhzKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRtZW1iZXIgPSBGMihcblx0ZnVuY3Rpb24gKHgsIHhzKSB7XG5cdFx0cmV0dXJuIEEyKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRhbnksXG5cdFx0XHRmdW5jdGlvbiAoYSkge1xuXHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmVxKGEsIHgpO1xuXHRcdFx0fSxcblx0XHRcdHhzKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRpc0VtcHR5ID0gZnVuY3Rpb24gKHhzKSB7XG5cdHZhciBfcDcgPSB4cztcblx0aWYgKF9wNy5jdG9yID09PSAnW10nKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkdGFpbCA9IGZ1bmN0aW9uIChsaXN0KSB7XG5cdHZhciBfcDggPSBsaXN0O1xuXHRpZiAoX3A4LmN0b3IgPT09ICc6OicpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkSnVzdChfcDguXzEpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHR9XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkaGVhZCA9IGZ1bmN0aW9uIChsaXN0KSB7XG5cdHZhciBfcDkgPSBsaXN0O1xuXHRpZiAoX3A5LmN0b3IgPT09ICc6OicpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkSnVzdChfcDkuXzApO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHR9XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzID0gX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmNvbnM7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRtYXAgPSBGMihcblx0ZnVuY3Rpb24gKGYsIHhzKSB7XG5cdFx0cmV0dXJuIEEzKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkcixcblx0XHRcdEYyKFxuXHRcdFx0XHRmdW5jdGlvbiAoeCwgYWNjKSB7XG5cdFx0XHRcdFx0cmV0dXJuIEEyKFxuXHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sXG5cdFx0XHRcdFx0XHRmKHgpLFxuXHRcdFx0XHRcdFx0YWNjKTtcblx0XHRcdFx0fSksXG5cdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFtdKSxcblx0XHRcdHhzKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRmaWx0ZXIgPSBGMihcblx0ZnVuY3Rpb24gKHByZWQsIHhzKSB7XG5cdFx0dmFyIGNvbmRpdGlvbmFsQ29ucyA9IEYyKFxuXHRcdFx0ZnVuY3Rpb24gKHgsIHhzJCkge1xuXHRcdFx0XHRyZXR1cm4gcHJlZCh4KSA/IEEyKF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLCB4LCB4cyQpIDogeHMkO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuIEEzKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkcixcblx0XHRcdGNvbmRpdGlvbmFsQ29ucyxcblx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0W10pLFxuXHRcdFx0eHMpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JG1heWJlQ29ucyA9IEYzKFxuXHRmdW5jdGlvbiAoZiwgbXgsIHhzKSB7XG5cdFx0dmFyIF9wMTAgPSBmKG14KTtcblx0XHRpZiAoX3AxMC5jdG9yID09PSAnSnVzdCcpIHtcblx0XHRcdHJldHVybiBBMihfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSwgX3AxMC5fMCwgeHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4geHM7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JGZpbHRlck1hcCA9IEYyKFxuXHRmdW5jdGlvbiAoZiwgeHMpIHtcblx0XHRyZXR1cm4gQTMoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGZvbGRyLFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRtYXliZUNvbnMoZiksXG5cdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFtdKSxcblx0XHRcdHhzKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRyZXZlcnNlID0gZnVuY3Rpb24gKGxpc3QpIHtcblx0cmV0dXJuIEEzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZGwsXG5cdFx0RjIoXG5cdFx0XHRmdW5jdGlvbiAoeCwgeSkge1xuXHRcdFx0XHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIHgsIHkpO1xuXHRcdFx0fSksXG5cdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0W10pLFxuXHRcdGxpc3QpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JHNjYW5sID0gRjMoXG5cdGZ1bmN0aW9uIChmLCBiLCB4cykge1xuXHRcdHZhciBzY2FuMSA9IEYyKFxuXHRcdFx0ZnVuY3Rpb24gKHgsIGFjY0FjYykge1xuXHRcdFx0XHR2YXIgX3AxMSA9IGFjY0FjYztcblx0XHRcdFx0aWYgKF9wMTEuY3RvciA9PT0gJzo6Jykge1xuXHRcdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLFxuXHRcdFx0XHRcdFx0QTIoZiwgeCwgX3AxMS5fMCksXG5cdFx0XHRcdFx0XHRhY2NBY2MpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0XHRbXSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRMaXN0JHJldmVyc2UoXG5cdFx0XHRBMyhcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkbCxcblx0XHRcdFx0c2NhbjEsXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0XHRbYl0pLFxuXHRcdFx0XHR4cykpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JGFwcGVuZCA9IEYyKFxuXHRmdW5jdGlvbiAoeHMsIHlzKSB7XG5cdFx0dmFyIF9wMTIgPSB5cztcblx0XHRpZiAoX3AxMi5jdG9yID09PSAnW10nKSB7XG5cdFx0XHRyZXR1cm4geHM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBBMyhcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkcixcblx0XHRcdFx0RjIoXG5cdFx0XHRcdFx0ZnVuY3Rpb24gKHgsIHkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBBMihfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSwgeCwgeSk7XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdHlzLFxuXHRcdFx0XHR4cyk7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JGNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0cykge1xuXHRyZXR1cm4gQTMoXG5cdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkcixcblx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGFwcGVuZCxcblx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRbXSksXG5cdFx0bGlzdHMpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JGNvbmNhdE1hcCA9IEYyKFxuXHRmdW5jdGlvbiAoZiwgbGlzdCkge1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRMaXN0JGNvbmNhdChcblx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJExpc3QkbWFwLCBmLCBsaXN0KSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkcGFydGl0aW9uID0gRjIoXG5cdGZ1bmN0aW9uIChwcmVkLCBsaXN0KSB7XG5cdFx0dmFyIHN0ZXAgPSBGMihcblx0XHRcdGZ1bmN0aW9uICh4LCBfcDEzKSB7XG5cdFx0XHRcdHZhciBfcDE0ID0gX3AxMztcblx0XHRcdFx0dmFyIF9wMTYgPSBfcDE0Ll8wO1xuXHRcdFx0XHR2YXIgX3AxNSA9IF9wMTQuXzE7XG5cdFx0XHRcdHJldHVybiBwcmVkKHgpID8ge1xuXHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRfMDogQTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIHgsIF9wMTYpLFxuXHRcdFx0XHRcdF8xOiBfcDE1XG5cdFx0XHRcdH0gOiB7XG5cdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdF8wOiBfcDE2LFxuXHRcdFx0XHRcdF8xOiBBMihfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSwgeCwgX3AxNSlcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiBBMyhcblx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZHIsXG5cdFx0XHRzdGVwLFxuXHRcdFx0e1xuXHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdF8wOiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0W10pLFxuXHRcdFx0XHRfMTogX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRcdFtdKVxuXHRcdFx0fSxcblx0XHRcdGxpc3QpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JHVuemlwID0gZnVuY3Rpb24gKHBhaXJzKSB7XG5cdHZhciBzdGVwID0gRjIoXG5cdFx0ZnVuY3Rpb24gKF9wMTgsIF9wMTcpIHtcblx0XHRcdHZhciBfcDE5ID0gX3AxODtcblx0XHRcdHZhciBfcDIwID0gX3AxNztcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XzA6IEEyKF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLCBfcDE5Ll8wLCBfcDIwLl8wKSxcblx0XHRcdFx0XzE6IEEyKF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLCBfcDE5Ll8xLCBfcDIwLl8xKVxuXHRcdFx0fTtcblx0XHR9KTtcblx0cmV0dXJuIEEzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZHIsXG5cdFx0c3RlcCxcblx0XHR7XG5cdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRfMDogX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRbXSksXG5cdFx0XHRfMTogX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRbXSlcblx0XHR9LFxuXHRcdHBhaXJzKTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRpbnRlcnNwZXJzZSA9IEYyKFxuXHRmdW5jdGlvbiAoc2VwLCB4cykge1xuXHRcdHZhciBfcDIxID0geHM7XG5cdFx0aWYgKF9wMjEuY3RvciA9PT0gJ1tdJykge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0W10pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgc3RlcCA9IEYyKFxuXHRcdFx0XHRmdW5jdGlvbiAoeCwgcmVzdCkge1xuXHRcdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLFxuXHRcdFx0XHRcdFx0c2VwLFxuXHRcdFx0XHRcdFx0QTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIHgsIHJlc3QpKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR2YXIgc3BlcnNlZCA9IEEzKFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGZvbGRyLFxuXHRcdFx0XHRzdGVwLFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0W10pLFxuXHRcdFx0XHRfcDIxLl8xKTtcblx0XHRcdHJldHVybiBBMihfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSwgX3AyMS5fMCwgc3BlcnNlZCk7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JHRha2VSZXZlcnNlID0gRjMoXG5cdGZ1bmN0aW9uIChuLCBsaXN0LCB0YWtlbikge1xuXHRcdHRha2VSZXZlcnNlOlxuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRpZiAoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNtcChuLCAwKSA8IDEpIHtcblx0XHRcdFx0cmV0dXJuIHRha2VuO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIF9wMjIgPSBsaXN0O1xuXHRcdFx0XHRpZiAoX3AyMi5jdG9yID09PSAnW10nKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRha2VuO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhciBfdjIzID0gbiAtIDEsXG5cdFx0XHRcdFx0XHRfdjI0ID0gX3AyMi5fMSxcblx0XHRcdFx0XHRcdF92MjUgPSBBMihfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSwgX3AyMi5fMCwgdGFrZW4pO1xuXHRcdFx0XHRcdG4gPSBfdjIzO1xuXHRcdFx0XHRcdGxpc3QgPSBfdjI0O1xuXHRcdFx0XHRcdHRha2VuID0gX3YyNTtcblx0XHRcdFx0XHRjb250aW51ZSB0YWtlUmV2ZXJzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCR0YWtlVGFpbFJlYyA9IEYyKFxuXHRmdW5jdGlvbiAobiwgbGlzdCkge1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRMaXN0JHJldmVyc2UoXG5cdFx0XHRBMyhcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCR0YWtlUmV2ZXJzZSxcblx0XHRcdFx0bixcblx0XHRcdFx0bGlzdCxcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRcdFtdKSkpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JHRha2VGYXN0ID0gRjMoXG5cdGZ1bmN0aW9uIChjdHIsIG4sIGxpc3QpIHtcblx0XHRpZiAoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNtcChuLCAwKSA8IDEpIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFtdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIF9wMjMgPSB7Y3RvcjogJ19UdXBsZTInLCBfMDogbiwgXzE6IGxpc3R9O1xuXHRcdFx0X3YyNl81OlxuXHRcdFx0ZG8ge1xuXHRcdFx0XHRfdjI2XzE6XG5cdFx0XHRcdGRvIHtcblx0XHRcdFx0XHRpZiAoX3AyMy5jdG9yID09PSAnX1R1cGxlMicpIHtcblx0XHRcdFx0XHRcdGlmIChfcDIzLl8xLmN0b3IgPT09ICdbXScpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGxpc3Q7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRpZiAoX3AyMy5fMS5fMS5jdG9yID09PSAnOjonKSB7XG5cdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChfcDIzLl8wKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MjZfMTtcblx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgMjpcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRbX3AyMy5fMS5fMCwgX3AyMy5fMS5fMS5fMF0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSAzOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoX3AyMy5fMS5fMS5fMS5jdG9yID09PSAnOjonKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFtfcDIzLl8xLl8wLCBfcDIzLl8xLl8xLl8wLCBfcDIzLl8xLl8xLl8xLl8wXSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YyNl81O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKF9wMjMuXzEuXzEuXzEuY3RvciA9PT0gJzo6JykgJiYgKF9wMjMuXzEuXzEuXzEuXzEuY3RvciA9PT0gJzo6JykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgX3AyOCA9IF9wMjMuXzEuXzEuXzEuXzA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIF9wMjcgPSBfcDIzLl8xLl8xLl8wO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZhciBfcDI2ID0gX3AyMy5fMS5fMDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgX3AyNSA9IF9wMjMuXzEuXzEuXzEuXzEuXzA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIF9wMjQgPSBfcDIzLl8xLl8xLl8xLl8xLl8xO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiAoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNtcChjdHIsIDEwMDApID4gMCkgPyBBMihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X3AyNixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdEEyKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X3AyNyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0QTIoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X3AyOCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRBMihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X3AyNSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJExpc3QkdGFrZVRhaWxSZWMsIG4gLSA0LCBfcDI0KSkpKSkgOiBBMihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X3AyNixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdEEyKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X3AyNyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0QTIoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X3AyOCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRBMihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X3AyNSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdEEzKF9lbG1fbGFuZyRjb3JlJExpc3QkdGFrZUZhc3QsIGN0ciArIDEsIG4gLSA0LCBfcDI0KSkpKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YyNl81O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChfcDIzLl8wID09PSAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjI2XzE7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MjZfNTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YnJlYWsgX3YyNl81O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSB3aGlsZShmYWxzZSk7XG5cdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0W19wMjMuXzEuXzBdKTtcblx0XHRcdH0gd2hpbGUoZmFsc2UpO1xuXHRcdFx0cmV0dXJuIGxpc3Q7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JHRha2UgPSBGMihcblx0ZnVuY3Rpb24gKG4sIGxpc3QpIHtcblx0XHRyZXR1cm4gQTMoX2VsbV9sYW5nJGNvcmUkTGlzdCR0YWtlRmFzdCwgMCwgbiwgbGlzdCk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkcmVwZWF0SGVscCA9IEYzKFxuXHRmdW5jdGlvbiAocmVzdWx0LCBuLCB2YWx1ZSkge1xuXHRcdHJlcGVhdEhlbHA6XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdGlmIChfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY21wKG4sIDApIDwgMSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIF92MjcgPSBBMihfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSwgdmFsdWUsIHJlc3VsdCksXG5cdFx0XHRcdFx0X3YyOCA9IG4gLSAxLFxuXHRcdFx0XHRcdF92MjkgPSB2YWx1ZTtcblx0XHRcdFx0cmVzdWx0ID0gX3YyNztcblx0XHRcdFx0biA9IF92Mjg7XG5cdFx0XHRcdHZhbHVlID0gX3YyOTtcblx0XHRcdFx0Y29udGludWUgcmVwZWF0SGVscDtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkcmVwZWF0ID0gRjIoXG5cdGZ1bmN0aW9uIChuLCB2YWx1ZSkge1xuXHRcdHJldHVybiBBMyhcblx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkcmVwZWF0SGVscCxcblx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0W10pLFxuXHRcdFx0bixcblx0XHRcdHZhbHVlKTtcblx0fSk7XG5cbnZhciBfZWxtX2xhbmckY29yZSRBcnJheSRhcHBlbmQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkuYXBwZW5kO1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JGxlbmd0aCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS5sZW5ndGg7XG52YXIgX2VsbV9sYW5nJGNvcmUkQXJyYXkkaXNFbXB0eSA9IGZ1bmN0aW9uIChhcnJheSkge1xuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmVxKFxuXHRcdF9lbG1fbGFuZyRjb3JlJEFycmF5JGxlbmd0aChhcnJheSksXG5cdFx0MCk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JHNsaWNlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LnNsaWNlO1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JHNldCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS5zZXQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkQXJyYXkkZ2V0ID0gRjIoXG5cdGZ1bmN0aW9uIChpLCBhcnJheSkge1xuXHRcdHJldHVybiAoKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jbXAoMCwgaSkgPCAxKSAmJiAoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNtcChcblx0XHRcdGksXG5cdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkubGVuZ3RoKGFycmF5KSkgPCAwKSkgPyBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0KFxuXHRcdFx0QTIoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LmdldCwgaSwgYXJyYXkpKSA6IF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmc7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JHB1c2ggPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkucHVzaDtcbnZhciBfZWxtX2xhbmckY29yZSRBcnJheSRlbXB0eSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS5lbXB0eTtcbnZhciBfZWxtX2xhbmckY29yZSRBcnJheSRmaWx0ZXIgPSBGMihcblx0ZnVuY3Rpb24gKGlzT2theSwgYXJyKSB7XG5cdFx0dmFyIHVwZGF0ZSA9IEYyKFxuXHRcdFx0ZnVuY3Rpb24gKHgsIHhzKSB7XG5cdFx0XHRcdHJldHVybiBpc09rYXkoeCkgPyBBMihfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkucHVzaCwgeCwgeHMpIDogeHM7XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gQTMoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LmZvbGRsLCB1cGRhdGUsIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS5lbXB0eSwgYXJyKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkQXJyYXkkZm9sZHIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkuZm9sZHI7XG52YXIgX2VsbV9sYW5nJGNvcmUkQXJyYXkkZm9sZGwgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkuZm9sZGw7XG52YXIgX2VsbV9sYW5nJGNvcmUkQXJyYXkkaW5kZXhlZE1hcCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS5pbmRleGVkTWFwO1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JG1hcCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS5tYXA7XG52YXIgX2VsbV9sYW5nJGNvcmUkQXJyYXkkdG9JbmRleGVkTGlzdCA9IGZ1bmN0aW9uIChhcnJheSkge1xuXHRyZXR1cm4gQTMoXG5cdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRtYXAyLFxuXHRcdEYyKFxuXHRcdFx0ZnVuY3Rpb24gKHYwLCB2MSkge1xuXHRcdFx0XHRyZXR1cm4ge2N0b3I6ICdfVHVwbGUyJywgXzA6IHYwLCBfMTogdjF9O1xuXHRcdFx0fSksXG5cdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QucmFuZ2UoXG5cdFx0XHQwLFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5Lmxlbmd0aChhcnJheSkgLSAxKSxcblx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkudG9MaXN0KGFycmF5KSk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JHRvTGlzdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS50b0xpc3Q7XG52YXIgX2VsbV9sYW5nJGNvcmUkQXJyYXkkZnJvbUxpc3QgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkuZnJvbUxpc3Q7XG52YXIgX2VsbV9sYW5nJGNvcmUkQXJyYXkkaW5pdGlhbGl6ZSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS5pbml0aWFsaXplO1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JHJlcGVhdCA9IEYyKFxuXHRmdW5jdGlvbiAobiwgZSkge1xuXHRcdHJldHVybiBBMihcblx0XHRcdF9lbG1fbGFuZyRjb3JlJEFycmF5JGluaXRpYWxpemUsXG5cdFx0XHRuLFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkQmFzaWNzJGFsd2F5cyhlKSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JEFycmF5ID0ge2N0b3I6ICdBcnJheSd9O1xuXG4vL2ltcG9ydCBOYXRpdmUuVXRpbHMgLy9cblxudmFyIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9DaGFyID0gZnVuY3Rpb24oKSB7XG5cbnJldHVybiB7XG5cdGZyb21Db2RlOiBmdW5jdGlvbihjKSB7IHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKFN0cmluZy5mcm9tQ2hhckNvZGUoYykpOyB9LFxuXHR0b0NvZGU6IGZ1bmN0aW9uKGMpIHsgcmV0dXJuIGMuY2hhckNvZGVBdCgwKTsgfSxcblx0dG9VcHBlcjogZnVuY3Rpb24oYykgeyByZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocihjLnRvVXBwZXJDYXNlKCkpOyB9LFxuXHR0b0xvd2VyOiBmdW5jdGlvbihjKSB7IHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKGMudG9Mb3dlckNhc2UoKSk7IH0sXG5cdHRvTG9jYWxlVXBwZXI6IGZ1bmN0aW9uKGMpIHsgcmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoYy50b0xvY2FsZVVwcGVyQ2FzZSgpKTsgfSxcblx0dG9Mb2NhbGVMb3dlcjogZnVuY3Rpb24oYykgeyByZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocihjLnRvTG9jYWxlTG93ZXJDYXNlKCkpOyB9XG59O1xuXG59KCk7XG52YXIgX2VsbV9sYW5nJGNvcmUkQ2hhciRmcm9tQ29kZSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9DaGFyLmZyb21Db2RlO1xudmFyIF9lbG1fbGFuZyRjb3JlJENoYXIkdG9Db2RlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0NoYXIudG9Db2RlO1xudmFyIF9lbG1fbGFuZyRjb3JlJENoYXIkdG9Mb2NhbGVMb3dlciA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9DaGFyLnRvTG9jYWxlTG93ZXI7XG52YXIgX2VsbV9sYW5nJGNvcmUkQ2hhciR0b0xvY2FsZVVwcGVyID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0NoYXIudG9Mb2NhbGVVcHBlcjtcbnZhciBfZWxtX2xhbmckY29yZSRDaGFyJHRvTG93ZXIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQ2hhci50b0xvd2VyO1xudmFyIF9lbG1fbGFuZyRjb3JlJENoYXIkdG9VcHBlciA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9DaGFyLnRvVXBwZXI7XG52YXIgX2VsbV9sYW5nJGNvcmUkQ2hhciRpc0JldHdlZW4gPSBGMyhcblx0ZnVuY3Rpb24gKGxvdywgaGlnaCwgJGNoYXIpIHtcblx0XHR2YXIgY29kZSA9IF9lbG1fbGFuZyRjb3JlJENoYXIkdG9Db2RlKCRjaGFyKTtcblx0XHRyZXR1cm4gKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jbXAoXG5cdFx0XHRjb2RlLFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkQ2hhciR0b0NvZGUobG93KSkgPiAtMSkgJiYgKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jbXAoXG5cdFx0XHRjb2RlLFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkQ2hhciR0b0NvZGUoaGlnaCkpIDwgMSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJENoYXIkaXNVcHBlciA9IEEyKFxuXHRfZWxtX2xhbmckY29yZSRDaGFyJGlzQmV0d2Vlbixcblx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocignQScpLFxuXHRfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKCdaJykpO1xudmFyIF9lbG1fbGFuZyRjb3JlJENoYXIkaXNMb3dlciA9IEEyKFxuXHRfZWxtX2xhbmckY29yZSRDaGFyJGlzQmV0d2Vlbixcblx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocignYScpLFxuXHRfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKCd6JykpO1xudmFyIF9lbG1fbGFuZyRjb3JlJENoYXIkaXNEaWdpdCA9IEEyKFxuXHRfZWxtX2xhbmckY29yZSRDaGFyJGlzQmV0d2Vlbixcblx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocignMCcpLFxuXHRfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKCc5JykpO1xudmFyIF9lbG1fbGFuZyRjb3JlJENoYXIkaXNPY3REaWdpdCA9IEEyKFxuXHRfZWxtX2xhbmckY29yZSRDaGFyJGlzQmV0d2Vlbixcblx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocignMCcpLFxuXHRfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKCc3JykpO1xudmFyIF9lbG1fbGFuZyRjb3JlJENoYXIkaXNIZXhEaWdpdCA9IGZ1bmN0aW9uICgkY2hhcikge1xuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkQ2hhciRpc0RpZ2l0KCRjaGFyKSB8fCAoQTMoXG5cdFx0X2VsbV9sYW5nJGNvcmUkQ2hhciRpc0JldHdlZW4sXG5cdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocignYScpLFxuXHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoJ2YnKSxcblx0XHQkY2hhcikgfHwgQTMoXG5cdFx0X2VsbV9sYW5nJGNvcmUkQ2hhciRpc0JldHdlZW4sXG5cdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocignQScpLFxuXHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoJ0YnKSxcblx0XHQkY2hhcikpO1xufTtcblxuLy9pbXBvcnQgTmF0aXZlLlV0aWxzIC8vXG5cbnZhciBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyID0gZnVuY3Rpb24oKSB7XG5cbnZhciBNQVhfU1RFUFMgPSAxMDAwMDtcblxuXG4vLyBUQVNLU1xuXG5mdW5jdGlvbiBzdWNjZWVkKHZhbHVlKVxue1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICdfVGFza19zdWNjZWVkJyxcblx0XHR2YWx1ZTogdmFsdWVcblx0fTtcbn1cblxuZnVuY3Rpb24gZmFpbChlcnJvcilcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnX1Rhc2tfZmFpbCcsXG5cdFx0dmFsdWU6IGVycm9yXG5cdH07XG59XG5cbmZ1bmN0aW9uIG5hdGl2ZUJpbmRpbmcoY2FsbGJhY2spXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJ19UYXNrX25hdGl2ZUJpbmRpbmcnLFxuXHRcdGNhbGxiYWNrOiBjYWxsYmFjayxcblx0XHRjYW5jZWw6IG51bGxcblx0fTtcbn1cblxuZnVuY3Rpb24gYW5kVGhlbih0YXNrLCBjYWxsYmFjaylcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnX1Rhc2tfYW5kVGhlbicsXG5cdFx0dGFzazogdGFzayxcblx0XHRjYWxsYmFjazogY2FsbGJhY2tcblx0fTtcbn1cblxuZnVuY3Rpb24gb25FcnJvcih0YXNrLCBjYWxsYmFjaylcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnX1Rhc2tfb25FcnJvcicsXG5cdFx0dGFzazogdGFzayxcblx0XHRjYWxsYmFjazogY2FsbGJhY2tcblx0fTtcbn1cblxuZnVuY3Rpb24gcmVjZWl2ZShjYWxsYmFjaylcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnX1Rhc2tfcmVjZWl2ZScsXG5cdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdH07XG59XG5cblxuLy8gUFJPQ0VTU0VTXG5cbmZ1bmN0aW9uIHJhd1NwYXduKHRhc2spXG57XG5cdHZhciBwcm9jZXNzID0ge1xuXHRcdGN0b3I6ICdfUHJvY2VzcycsXG5cdFx0aWQ6IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5ndWlkKCksXG5cdFx0cm9vdDogdGFzayxcblx0XHRzdGFjazogbnVsbCxcblx0XHRtYWlsYm94OiBbXVxuXHR9O1xuXG5cdGVucXVldWUocHJvY2Vzcyk7XG5cblx0cmV0dXJuIHByb2Nlc3M7XG59XG5cbmZ1bmN0aW9uIHNwYXduKHRhc2spXG57XG5cdHJldHVybiBuYXRpdmVCaW5kaW5nKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0dmFyIHByb2Nlc3MgPSByYXdTcGF3bih0YXNrKTtcblx0XHRjYWxsYmFjayhzdWNjZWVkKHByb2Nlc3MpKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIHJhd1NlbmQocHJvY2VzcywgbXNnKVxue1xuXHRwcm9jZXNzLm1haWxib3gucHVzaChtc2cpO1xuXHRlbnF1ZXVlKHByb2Nlc3MpO1xufVxuXG5mdW5jdGlvbiBzZW5kKHByb2Nlc3MsIG1zZylcbntcblx0cmV0dXJuIG5hdGl2ZUJpbmRpbmcoZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHRyYXdTZW5kKHByb2Nlc3MsIG1zZyk7XG5cdFx0Y2FsbGJhY2soc3VjY2VlZChfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuVHVwbGUwKSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBraWxsKHByb2Nlc3MpXG57XG5cdHJldHVybiBuYXRpdmVCaW5kaW5nKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0dmFyIHJvb3QgPSBwcm9jZXNzLnJvb3Q7XG5cdFx0aWYgKHJvb3QuY3RvciA9PT0gJ19UYXNrX25hdGl2ZUJpbmRpbmcnICYmIHJvb3QuY2FuY2VsKVxuXHRcdHtcblx0XHRcdHJvb3QuY2FuY2VsKCk7XG5cdFx0fVxuXG5cdFx0cHJvY2Vzcy5yb290ID0gbnVsbDtcblxuXHRcdGNhbGxiYWNrKHN1Y2NlZWQoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLlR1cGxlMCkpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gc2xlZXAodGltZSlcbntcblx0cmV0dXJuIG5hdGl2ZUJpbmRpbmcoZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHR2YXIgaWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0Y2FsbGJhY2soc3VjY2VlZChfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuVHVwbGUwKSk7XG5cdFx0fSwgdGltZSk7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7IGNsZWFyVGltZW91dChpZCk7IH07XG5cdH0pO1xufVxuXG5cbi8vIFNURVAgUFJPQ0VTU0VTXG5cbmZ1bmN0aW9uIHN0ZXAobnVtU3RlcHMsIHByb2Nlc3MpXG57XG5cdHdoaWxlIChudW1TdGVwcyA8IE1BWF9TVEVQUylcblx0e1xuXHRcdHZhciBjdG9yID0gcHJvY2Vzcy5yb290LmN0b3I7XG5cblx0XHRpZiAoY3RvciA9PT0gJ19UYXNrX3N1Y2NlZWQnKVxuXHRcdHtcblx0XHRcdHdoaWxlIChwcm9jZXNzLnN0YWNrICYmIHByb2Nlc3Muc3RhY2suY3RvciA9PT0gJ19UYXNrX29uRXJyb3InKVxuXHRcdFx0e1xuXHRcdFx0XHRwcm9jZXNzLnN0YWNrID0gcHJvY2Vzcy5zdGFjay5yZXN0O1xuXHRcdFx0fVxuXHRcdFx0aWYgKHByb2Nlc3Muc3RhY2sgPT09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0cHJvY2Vzcy5yb290ID0gcHJvY2Vzcy5zdGFjay5jYWxsYmFjayhwcm9jZXNzLnJvb3QudmFsdWUpO1xuXHRcdFx0cHJvY2Vzcy5zdGFjayA9IHByb2Nlc3Muc3RhY2sucmVzdDtcblx0XHRcdCsrbnVtU3RlcHM7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoY3RvciA9PT0gJ19UYXNrX2ZhaWwnKVxuXHRcdHtcblx0XHRcdHdoaWxlIChwcm9jZXNzLnN0YWNrICYmIHByb2Nlc3Muc3RhY2suY3RvciA9PT0gJ19UYXNrX2FuZFRoZW4nKVxuXHRcdFx0e1xuXHRcdFx0XHRwcm9jZXNzLnN0YWNrID0gcHJvY2Vzcy5zdGFjay5yZXN0O1xuXHRcdFx0fVxuXHRcdFx0aWYgKHByb2Nlc3Muc3RhY2sgPT09IG51bGwpXG5cdFx0XHR7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0cHJvY2Vzcy5yb290ID0gcHJvY2Vzcy5zdGFjay5jYWxsYmFjayhwcm9jZXNzLnJvb3QudmFsdWUpO1xuXHRcdFx0cHJvY2Vzcy5zdGFjayA9IHByb2Nlc3Muc3RhY2sucmVzdDtcblx0XHRcdCsrbnVtU3RlcHM7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoY3RvciA9PT0gJ19UYXNrX2FuZFRoZW4nKVxuXHRcdHtcblx0XHRcdHByb2Nlc3Muc3RhY2sgPSB7XG5cdFx0XHRcdGN0b3I6ICdfVGFza19hbmRUaGVuJyxcblx0XHRcdFx0Y2FsbGJhY2s6IHByb2Nlc3Mucm9vdC5jYWxsYmFjayxcblx0XHRcdFx0cmVzdDogcHJvY2Vzcy5zdGFja1xuXHRcdFx0fTtcblx0XHRcdHByb2Nlc3Mucm9vdCA9IHByb2Nlc3Mucm9vdC50YXNrO1xuXHRcdFx0KytudW1TdGVwcztcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmIChjdG9yID09PSAnX1Rhc2tfb25FcnJvcicpXG5cdFx0e1xuXHRcdFx0cHJvY2Vzcy5zdGFjayA9IHtcblx0XHRcdFx0Y3RvcjogJ19UYXNrX29uRXJyb3InLFxuXHRcdFx0XHRjYWxsYmFjazogcHJvY2Vzcy5yb290LmNhbGxiYWNrLFxuXHRcdFx0XHRyZXN0OiBwcm9jZXNzLnN0YWNrXG5cdFx0XHR9O1xuXHRcdFx0cHJvY2Vzcy5yb290ID0gcHJvY2Vzcy5yb290LnRhc2s7XG5cdFx0XHQrK251bVN0ZXBzO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKGN0b3IgPT09ICdfVGFza19uYXRpdmVCaW5kaW5nJylcblx0XHR7XG5cdFx0XHRwcm9jZXNzLnJvb3QuY2FuY2VsID0gcHJvY2Vzcy5yb290LmNhbGxiYWNrKGZ1bmN0aW9uKG5ld1Jvb3QpIHtcblx0XHRcdFx0cHJvY2Vzcy5yb290ID0gbmV3Um9vdDtcblx0XHRcdFx0ZW5xdWV1ZShwcm9jZXNzKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRpZiAoY3RvciA9PT0gJ19UYXNrX3JlY2VpdmUnKVxuXHRcdHtcblx0XHRcdHZhciBtYWlsYm94ID0gcHJvY2Vzcy5tYWlsYm94O1xuXHRcdFx0aWYgKG1haWxib3gubGVuZ3RoID09PSAwKVxuXHRcdFx0e1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0cHJvY2Vzcy5yb290ID0gcHJvY2Vzcy5yb290LmNhbGxiYWNrKG1haWxib3guc2hpZnQoKSk7XG5cdFx0XHQrK251bVN0ZXBzO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0dGhyb3cgbmV3IEVycm9yKGN0b3IpO1xuXHR9XG5cblx0aWYgKG51bVN0ZXBzIDwgTUFYX1NURVBTKVxuXHR7XG5cdFx0cmV0dXJuIG51bVN0ZXBzICsgMTtcblx0fVxuXHRlbnF1ZXVlKHByb2Nlc3MpO1xuXG5cdHJldHVybiBudW1TdGVwcztcbn1cblxuXG4vLyBXT1JLIFFVRVVFXG5cbnZhciB3b3JraW5nID0gZmFsc2U7XG52YXIgd29ya1F1ZXVlID0gW107XG5cbmZ1bmN0aW9uIGVucXVldWUocHJvY2Vzcylcbntcblx0d29ya1F1ZXVlLnB1c2gocHJvY2Vzcyk7XG5cblx0aWYgKCF3b3JraW5nKVxuXHR7XG5cdFx0c2V0VGltZW91dCh3b3JrLCAwKTtcblx0XHR3b3JraW5nID0gdHJ1ZTtcblx0fVxufVxuXG5mdW5jdGlvbiB3b3JrKClcbntcblx0dmFyIG51bVN0ZXBzID0gMDtcblx0dmFyIHByb2Nlc3M7XG5cdHdoaWxlIChudW1TdGVwcyA8IE1BWF9TVEVQUyAmJiAocHJvY2VzcyA9IHdvcmtRdWV1ZS5zaGlmdCgpKSlcblx0e1xuXHRcdGlmIChwcm9jZXNzLnJvb3QpXG5cdFx0e1xuXHRcdFx0bnVtU3RlcHMgPSBzdGVwKG51bVN0ZXBzLCBwcm9jZXNzKTtcblx0XHR9XG5cdH1cblx0aWYgKCFwcm9jZXNzKVxuXHR7XG5cdFx0d29ya2luZyA9IGZhbHNlO1xuXHRcdHJldHVybjtcblx0fVxuXHRzZXRUaW1lb3V0KHdvcmssIDApO1xufVxuXG5cbnJldHVybiB7XG5cdHN1Y2NlZWQ6IHN1Y2NlZWQsXG5cdGZhaWw6IGZhaWwsXG5cdG5hdGl2ZUJpbmRpbmc6IG5hdGl2ZUJpbmRpbmcsXG5cdGFuZFRoZW46IEYyKGFuZFRoZW4pLFxuXHRvbkVycm9yOiBGMihvbkVycm9yKSxcblx0cmVjZWl2ZTogcmVjZWl2ZSxcblxuXHRzcGF3bjogc3Bhd24sXG5cdGtpbGw6IGtpbGwsXG5cdHNsZWVwOiBzbGVlcCxcblx0c2VuZDogRjIoc2VuZCksXG5cblx0cmF3U3Bhd246IHJhd1NwYXduLFxuXHRyYXdTZW5kOiByYXdTZW5kXG59O1xuXG59KCk7XG4vL2ltcG9ydCAvL1xuXG52YXIgX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1BsYXRmb3JtID0gZnVuY3Rpb24oKSB7XG5cblxuLy8gUFJPR1JBTVNcblxuZnVuY3Rpb24gYWRkUHVibGljTW9kdWxlKG9iamVjdCwgbmFtZSwgbWFpbilcbntcblx0dmFyIGluaXQgPSBtYWluID8gbWFrZUVtYmVkKG5hbWUsIG1haW4pIDogbWFpbklzVW5kZWZpbmVkKG5hbWUpO1xuXG5cdG9iamVjdFsnd29ya2VyJ10gPSBmdW5jdGlvbiB3b3JrZXIoZmxhZ3MpXG5cdHtcblx0XHRyZXR1cm4gaW5pdCh1bmRlZmluZWQsIGZsYWdzLCBmYWxzZSk7XG5cdH1cblxuXHRvYmplY3RbJ2VtYmVkJ10gPSBmdW5jdGlvbiBlbWJlZChkb21Ob2RlLCBmbGFncylcblx0e1xuXHRcdHJldHVybiBpbml0KGRvbU5vZGUsIGZsYWdzLCB0cnVlKTtcblx0fVxuXG5cdG9iamVjdFsnZnVsbHNjcmVlbiddID0gZnVuY3Rpb24gZnVsbHNjcmVlbihmbGFncylcblx0e1xuXHRcdHJldHVybiBpbml0KGRvY3VtZW50LmJvZHksIGZsYWdzLCB0cnVlKTtcblx0fTtcbn1cblxuXG4vLyBQUk9HUkFNIEZBSUxcblxuZnVuY3Rpb24gbWFpbklzVW5kZWZpbmVkKG5hbWUpXG57XG5cdHJldHVybiBmdW5jdGlvbihkb21Ob2RlKVxuXHR7XG5cdFx0dmFyIG1lc3NhZ2UgPSAnQ2Fubm90IGluaXRpYWxpemUgbW9kdWxlIGAnICsgbmFtZSArXG5cdFx0XHQnYCBiZWNhdXNlIGl0IGhhcyBubyBgbWFpbmAgdmFsdWUhXFxuV2hhdCBzaG91bGQgSSBzaG93IG9uIHNjcmVlbj8nO1xuXHRcdGRvbU5vZGUuaW5uZXJIVE1MID0gZXJyb3JIdG1sKG1lc3NhZ2UpO1xuXHRcdHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcblx0fTtcbn1cblxuZnVuY3Rpb24gZXJyb3JIdG1sKG1lc3NhZ2UpXG57XG5cdHJldHVybiAnPGRpdiBzdHlsZT1cInBhZGRpbmctbGVmdDoxZW07XCI+J1xuXHRcdCsgJzxoMiBzdHlsZT1cImZvbnQtd2VpZ2h0Om5vcm1hbDtcIj48Yj5Pb3BzITwvYj4gU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hlbiBzdGFydGluZyB5b3VyIEVsbSBwcm9ncmFtLjwvaDI+J1xuXHRcdCsgJzxwcmUgc3R5bGU9XCJwYWRkaW5nLWxlZnQ6MWVtO1wiPicgKyBtZXNzYWdlICsgJzwvcHJlPidcblx0XHQrICc8L2Rpdj4nO1xufVxuXG5cbi8vIFBST0dSQU0gU1VDQ0VTU1xuXG5mdW5jdGlvbiBtYWtlRW1iZWQobW9kdWxlTmFtZSwgbWFpbilcbntcblx0cmV0dXJuIGZ1bmN0aW9uIGVtYmVkKHJvb3REb21Ob2RlLCBmbGFncywgd2l0aFJlbmRlcmVyKVxuXHR7XG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0dmFyIHByb2dyYW0gPSBtYWluVG9Qcm9ncmFtKG1vZHVsZU5hbWUsIG1haW4pO1xuXHRcdFx0aWYgKCF3aXRoUmVuZGVyZXIpXG5cdFx0XHR7XG5cdFx0XHRcdHByb2dyYW0ucmVuZGVyZXIgPSBkdW1teVJlbmRlcmVyO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG1ha2VFbWJlZEhlbHAobW9kdWxlTmFtZSwgcHJvZ3JhbSwgcm9vdERvbU5vZGUsIGZsYWdzKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpXG5cdFx0e1xuXHRcdFx0cm9vdERvbU5vZGUuaW5uZXJIVE1MID0gZXJyb3JIdG1sKGUubWVzc2FnZSk7XG5cdFx0XHR0aHJvdyBlO1xuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gZHVtbXlSZW5kZXJlcigpXG57XG5cdHJldHVybiB7IHVwZGF0ZTogZnVuY3Rpb24oKSB7fSB9O1xufVxuXG5cbi8vIE1BSU4gVE8gUFJPR1JBTVxuXG5mdW5jdGlvbiBtYWluVG9Qcm9ncmFtKG1vZHVsZU5hbWUsIHdyYXBwZWRNYWluKVxue1xuXHR2YXIgbWFpbiA9IHdyYXBwZWRNYWluLm1haW47XG5cblx0aWYgKHR5cGVvZiBtYWluLmluaXQgPT09ICd1bmRlZmluZWQnKVxuXHR7XG5cdFx0dmFyIGVtcHR5QmFnID0gYmF0Y2goX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuTmlsKTtcblx0XHR2YXIgbm9DaGFuZ2UgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuVHVwbGUyKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLlR1cGxlMCxcblx0XHRcdGVtcHR5QmFnXG5cdFx0KTtcblxuXHRcdHJldHVybiBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRwcm9ncmFtV2l0aEZsYWdzKHtcblx0XHRcdGluaXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gbm9DaGFuZ2U7IH0sXG5cdFx0XHR2aWV3OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1haW47IH0sXG5cdFx0XHR1cGRhdGU6IEYyKGZ1bmN0aW9uKCkgeyByZXR1cm4gbm9DaGFuZ2U7IH0pLFxuXHRcdFx0c3Vic2NyaXB0aW9uczogZnVuY3Rpb24gKCkgeyByZXR1cm4gZW1wdHlCYWc7IH1cblx0XHR9KTtcblx0fVxuXG5cdHZhciBmbGFncyA9IHdyYXBwZWRNYWluLmZsYWdzO1xuXHR2YXIgaW5pdCA9IGZsYWdzXG5cdFx0PyBpbml0V2l0aEZsYWdzKG1vZHVsZU5hbWUsIG1haW4uaW5pdCwgZmxhZ3MpXG5cdFx0OiBpbml0V2l0aG91dEZsYWdzKG1vZHVsZU5hbWUsIG1haW4uaW5pdCk7XG5cblx0cmV0dXJuIF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJHByb2dyYW1XaXRoRmxhZ3Moe1xuXHRcdGluaXQ6IGluaXQsXG5cdFx0dmlldzogbWFpbi52aWV3LFxuXHRcdHVwZGF0ZTogbWFpbi51cGRhdGUsXG5cdFx0c3Vic2NyaXB0aW9uczogbWFpbi5zdWJzY3JpcHRpb25zLFxuXHR9KTtcbn1cblxuZnVuY3Rpb24gaW5pdFdpdGhvdXRGbGFncyhtb2R1bGVOYW1lLCByZWFsSW5pdClcbntcblx0cmV0dXJuIGZ1bmN0aW9uIGluaXQoZmxhZ3MpXG5cdHtcblx0XHRpZiAodHlwZW9mIGZsYWdzICE9PSAndW5kZWZpbmVkJylcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdCdZb3UgYXJlIGdpdmluZyBtb2R1bGUgYCcgKyBtb2R1bGVOYW1lICsgJ2AgYW4gYXJndW1lbnQgaW4gSmF2YVNjcmlwdC5cXG4nXG5cdFx0XHRcdCsgJ1RoaXMgbW9kdWxlIGRvZXMgbm90IHRha2UgYXJndW1lbnRzIHRob3VnaCEgWW91IHByb2JhYmx5IG5lZWQgdG8gY2hhbmdlIHRoZVxcbidcblx0XHRcdFx0KyAnaW5pdGlhbGl6YXRpb24gY29kZSB0byBzb21ldGhpbmcgbGlrZSBgRWxtLicgKyBtb2R1bGVOYW1lICsgJy5mdWxsc2NyZWVuKClgJ1xuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlYWxJbml0KCk7XG5cdH07XG59XG5cbmZ1bmN0aW9uIGluaXRXaXRoRmxhZ3MobW9kdWxlTmFtZSwgcmVhbEluaXQsIGZsYWdEZWNvZGVyKVxue1xuXHRyZXR1cm4gZnVuY3Rpb24gaW5pdChmbGFncylcblx0e1xuXHRcdHZhciByZXN1bHQgPSBBMihfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5ydW4sIGZsYWdEZWNvZGVyLCBmbGFncyk7XG5cdFx0aWYgKHJlc3VsdC5jdG9yID09PSAnRXJyJylcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdCdZb3UgYXJlIHRyeWluZyB0byBpbml0aWFsaXplIG1vZHVsZSBgJyArIG1vZHVsZU5hbWUgKyAnYCB3aXRoIGFuIHVuZXhwZWN0ZWQgYXJndW1lbnQuXFxuJ1xuXHRcdFx0XHQrICdXaGVuIHRyeWluZyB0byBjb252ZXJ0IGl0IHRvIGEgdXNhYmxlIEVsbSB2YWx1ZSwgSSBydW4gaW50byB0aGlzIHByb2JsZW06XFxuXFxuJ1xuXHRcdFx0XHQrIHJlc3VsdC5fMFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlYWxJbml0KHJlc3VsdC5fMCk7XG5cdH07XG59XG5cblxuLy8gU0VUVVAgUlVOVElNRSBTWVNURU1cblxuZnVuY3Rpb24gbWFrZUVtYmVkSGVscChtb2R1bGVOYW1lLCBwcm9ncmFtLCByb290RG9tTm9kZSwgZmxhZ3MpXG57XG5cdHZhciBpbml0ID0gcHJvZ3JhbS5pbml0O1xuXHR2YXIgdXBkYXRlID0gcHJvZ3JhbS51cGRhdGU7XG5cdHZhciBzdWJzY3JpcHRpb25zID0gcHJvZ3JhbS5zdWJzY3JpcHRpb25zO1xuXHR2YXIgdmlldyA9IHByb2dyYW0udmlldztcblx0dmFyIG1ha2VSZW5kZXJlciA9IHByb2dyYW0ucmVuZGVyZXI7XG5cblx0Ly8gYW1iaWVudCBzdGF0ZVxuXHR2YXIgbWFuYWdlcnMgPSB7fTtcblx0dmFyIHJlbmRlcmVyO1xuXG5cdC8vIGluaXQgYW5kIHVwZGF0ZSBzdGF0ZSBpbiBtYWluIHByb2Nlc3Ncblx0dmFyIGluaXRBcHAgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLm5hdGl2ZUJpbmRpbmcoZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHR2YXIgcmVzdWx0cyA9IGluaXQoZmxhZ3MpO1xuXHRcdHZhciBtb2RlbCA9IHJlc3VsdHMuXzA7XG5cdFx0cmVuZGVyZXIgPSBtYWtlUmVuZGVyZXIocm9vdERvbU5vZGUsIGVucXVldWUsIHZpZXcobW9kZWwpKTtcblx0XHR2YXIgY21kcyA9IHJlc3VsdHMuXzE7XG5cdFx0dmFyIHN1YnMgPSBzdWJzY3JpcHRpb25zKG1vZGVsKTtcblx0XHRkaXNwYXRjaEVmZmVjdHMobWFuYWdlcnMsIGNtZHMsIHN1YnMpO1xuXHRcdGNhbGxiYWNrKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIuc3VjY2VlZChtb2RlbCkpO1xuXHR9KTtcblxuXHRmdW5jdGlvbiBvbk1lc3NhZ2UobXNnLCBtb2RlbClcblx0e1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLm5hdGl2ZUJpbmRpbmcoZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHRcdHZhciByZXN1bHRzID0gQTIodXBkYXRlLCBtc2csIG1vZGVsKTtcblx0XHRcdG1vZGVsID0gcmVzdWx0cy5fMDtcblx0XHRcdHJlbmRlcmVyLnVwZGF0ZSh2aWV3KG1vZGVsKSk7XG5cdFx0XHR2YXIgY21kcyA9IHJlc3VsdHMuXzE7XG5cdFx0XHR2YXIgc3VicyA9IHN1YnNjcmlwdGlvbnMobW9kZWwpO1xuXHRcdFx0ZGlzcGF0Y2hFZmZlY3RzKG1hbmFnZXJzLCBjbWRzLCBzdWJzKTtcblx0XHRcdGNhbGxiYWNrKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIuc3VjY2VlZChtb2RlbCkpO1xuXHRcdH0pO1xuXHR9XG5cblx0dmFyIG1haW5Qcm9jZXNzID0gc3Bhd25Mb29wKGluaXRBcHAsIG9uTWVzc2FnZSk7XG5cblx0ZnVuY3Rpb24gZW5xdWV1ZShtc2cpXG5cdHtcblx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLnJhd1NlbmQobWFpblByb2Nlc3MsIG1zZyk7XG5cdH1cblxuXHR2YXIgcG9ydHMgPSBzZXR1cEVmZmVjdHMobWFuYWdlcnMsIGVucXVldWUpO1xuXG5cdHJldHVybiBwb3J0cyA/IHsgcG9ydHM6IHBvcnRzIH0gOiB7fTtcbn1cblxuXG4vLyBFRkZFQ1QgTUFOQUdFUlNcblxudmFyIGVmZmVjdE1hbmFnZXJzID0ge307XG5cbmZ1bmN0aW9uIHNldHVwRWZmZWN0cyhtYW5hZ2VycywgY2FsbGJhY2spXG57XG5cdHZhciBwb3J0cztcblxuXHQvLyBzZXR1cCBhbGwgbmVjZXNzYXJ5IGVmZmVjdCBtYW5hZ2Vyc1xuXHRmb3IgKHZhciBrZXkgaW4gZWZmZWN0TWFuYWdlcnMpXG5cdHtcblx0XHR2YXIgbWFuYWdlciA9IGVmZmVjdE1hbmFnZXJzW2tleV07XG5cblx0XHRpZiAobWFuYWdlci5pc0ZvcmVpZ24pXG5cdFx0e1xuXHRcdFx0cG9ydHMgPSBwb3J0cyB8fCB7fTtcblx0XHRcdHBvcnRzW2tleV0gPSBtYW5hZ2VyLnRhZyA9PT0gJ2NtZCdcblx0XHRcdFx0PyBzZXR1cE91dGdvaW5nUG9ydChrZXkpXG5cdFx0XHRcdDogc2V0dXBJbmNvbWluZ1BvcnQoa2V5LCBjYWxsYmFjayk7XG5cdFx0fVxuXG5cdFx0bWFuYWdlcnNba2V5XSA9IG1ha2VNYW5hZ2VyKG1hbmFnZXIsIGNhbGxiYWNrKTtcblx0fVxuXG5cdHJldHVybiBwb3J0cztcbn1cblxuZnVuY3Rpb24gbWFrZU1hbmFnZXIoaW5mbywgY2FsbGJhY2spXG57XG5cdHZhciByb3V0ZXIgPSB7XG5cdFx0bWFpbjogY2FsbGJhY2ssXG5cdFx0c2VsZjogdW5kZWZpbmVkXG5cdH07XG5cblx0dmFyIHRhZyA9IGluZm8udGFnO1xuXHR2YXIgb25FZmZlY3RzID0gaW5mby5vbkVmZmVjdHM7XG5cdHZhciBvblNlbGZNc2cgPSBpbmZvLm9uU2VsZk1zZztcblxuXHRmdW5jdGlvbiBvbk1lc3NhZ2UobXNnLCBzdGF0ZSlcblx0e1xuXHRcdGlmIChtc2cuY3RvciA9PT0gJ3NlbGYnKVxuXHRcdHtcblx0XHRcdHJldHVybiBBMyhvblNlbGZNc2csIHJvdXRlciwgbXNnLl8wLCBzdGF0ZSk7XG5cdFx0fVxuXG5cdFx0dmFyIGZ4ID0gbXNnLl8wO1xuXHRcdHN3aXRjaCAodGFnKVxuXHRcdHtcblx0XHRcdGNhc2UgJ2NtZCc6XG5cdFx0XHRcdHJldHVybiBBMyhvbkVmZmVjdHMsIHJvdXRlciwgZnguY21kcywgc3RhdGUpO1xuXG5cdFx0XHRjYXNlICdzdWInOlxuXHRcdFx0XHRyZXR1cm4gQTMob25FZmZlY3RzLCByb3V0ZXIsIGZ4LnN1YnMsIHN0YXRlKTtcblxuXHRcdFx0Y2FzZSAnZngnOlxuXHRcdFx0XHRyZXR1cm4gQTQob25FZmZlY3RzLCByb3V0ZXIsIGZ4LmNtZHMsIGZ4LnN1YnMsIHN0YXRlKTtcblx0XHR9XG5cdH1cblxuXHR2YXIgcHJvY2VzcyA9IHNwYXduTG9vcChpbmZvLmluaXQsIG9uTWVzc2FnZSk7XG5cdHJvdXRlci5zZWxmID0gcHJvY2Vzcztcblx0cmV0dXJuIHByb2Nlc3M7XG59XG5cbmZ1bmN0aW9uIHNlbmRUb0FwcChyb3V0ZXIsIG1zZylcbntcblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIubmF0aXZlQmluZGluZyhmdW5jdGlvbihjYWxsYmFjaylcblx0e1xuXHRcdHJvdXRlci5tYWluKG1zZyk7XG5cdFx0Y2FsbGJhY2soX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1NjaGVkdWxlci5zdWNjZWVkKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5UdXBsZTApKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIHNlbmRUb1NlbGYocm91dGVyLCBtc2cpXG57XG5cdHJldHVybiBBMihfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLnNlbmQsIHJvdXRlci5zZWxmLCB7XG5cdFx0Y3RvcjogJ3NlbGYnLFxuXHRcdF8wOiBtc2dcblx0fSk7XG59XG5cblxuLy8gSEVMUEVSIGZvciBTVEFURUZVTCBMT09QU1xuXG5mdW5jdGlvbiBzcGF3bkxvb3AoaW5pdCwgb25NZXNzYWdlKVxue1xuXHR2YXIgYW5kVGhlbiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIuYW5kVGhlbjtcblxuXHRmdW5jdGlvbiBsb29wKHN0YXRlKVxuXHR7XG5cdFx0dmFyIGhhbmRsZU1zZyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIucmVjZWl2ZShmdW5jdGlvbihtc2cpIHtcblx0XHRcdHJldHVybiBvbk1lc3NhZ2UobXNnLCBzdGF0ZSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIEEyKGFuZFRoZW4sIGhhbmRsZU1zZywgbG9vcCk7XG5cdH1cblxuXHR2YXIgdGFzayA9IEEyKGFuZFRoZW4sIGluaXQsIGxvb3ApO1xuXG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLnJhd1NwYXduKHRhc2spO1xufVxuXG5cbi8vIEJBR1NcblxuZnVuY3Rpb24gbGVhZihob21lKVxue1xuXHRyZXR1cm4gZnVuY3Rpb24odmFsdWUpXG5cdHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dHlwZTogJ2xlYWYnLFxuXHRcdFx0aG9tZTogaG9tZSxcblx0XHRcdHZhbHVlOiB2YWx1ZVxuXHRcdH07XG5cdH07XG59XG5cbmZ1bmN0aW9uIGJhdGNoKGxpc3QpXG57XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ25vZGUnLFxuXHRcdGJyYW5jaGVzOiBsaXN0XG5cdH07XG59XG5cbmZ1bmN0aW9uIG1hcCh0YWdnZXIsIGJhZylcbntcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnbWFwJyxcblx0XHR0YWdnZXI6IHRhZ2dlcixcblx0XHR0cmVlOiBiYWdcblx0fVxufVxuXG5cbi8vIFBJUEUgQkFHUyBJTlRPIEVGRkVDVCBNQU5BR0VSU1xuXG5mdW5jdGlvbiBkaXNwYXRjaEVmZmVjdHMobWFuYWdlcnMsIGNtZEJhZywgc3ViQmFnKVxue1xuXHR2YXIgZWZmZWN0c0RpY3QgPSB7fTtcblx0Z2F0aGVyRWZmZWN0cyh0cnVlLCBjbWRCYWcsIGVmZmVjdHNEaWN0LCBudWxsKTtcblx0Z2F0aGVyRWZmZWN0cyhmYWxzZSwgc3ViQmFnLCBlZmZlY3RzRGljdCwgbnVsbCk7XG5cblx0Zm9yICh2YXIgaG9tZSBpbiBtYW5hZ2Vycylcblx0e1xuXHRcdHZhciBmeCA9IGhvbWUgaW4gZWZmZWN0c0RpY3Rcblx0XHRcdD8gZWZmZWN0c0RpY3RbaG9tZV1cblx0XHRcdDoge1xuXHRcdFx0XHRjbWRzOiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5OaWwsXG5cdFx0XHRcdHN1YnM6IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0Lk5pbFxuXHRcdFx0fTtcblxuXHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIucmF3U2VuZChtYW5hZ2Vyc1tob21lXSwgeyBjdG9yOiAnZngnLCBfMDogZnggfSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2F0aGVyRWZmZWN0cyhpc0NtZCwgYmFnLCBlZmZlY3RzRGljdCwgdGFnZ2Vycylcbntcblx0c3dpdGNoIChiYWcudHlwZSlcblx0e1xuXHRcdGNhc2UgJ2xlYWYnOlxuXHRcdFx0dmFyIGhvbWUgPSBiYWcuaG9tZTtcblx0XHRcdHZhciBlZmZlY3QgPSB0b0VmZmVjdChpc0NtZCwgaG9tZSwgdGFnZ2VycywgYmFnLnZhbHVlKTtcblx0XHRcdGVmZmVjdHNEaWN0W2hvbWVdID0gaW5zZXJ0KGlzQ21kLCBlZmZlY3QsIGVmZmVjdHNEaWN0W2hvbWVdKTtcblx0XHRcdHJldHVybjtcblxuXHRcdGNhc2UgJ25vZGUnOlxuXHRcdFx0dmFyIGxpc3QgPSBiYWcuYnJhbmNoZXM7XG5cdFx0XHR3aGlsZSAobGlzdC5jdG9yICE9PSAnW10nKVxuXHRcdFx0e1xuXHRcdFx0XHRnYXRoZXJFZmZlY3RzKGlzQ21kLCBsaXN0Ll8wLCBlZmZlY3RzRGljdCwgdGFnZ2Vycyk7XG5cdFx0XHRcdGxpc3QgPSBsaXN0Ll8xO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Y2FzZSAnbWFwJzpcblx0XHRcdGdhdGhlckVmZmVjdHMoaXNDbWQsIGJhZy50cmVlLCBlZmZlY3RzRGljdCwge1xuXHRcdFx0XHR0YWdnZXI6IGJhZy50YWdnZXIsXG5cdFx0XHRcdHJlc3Q6IHRhZ2dlcnNcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHRvRWZmZWN0KGlzQ21kLCBob21lLCB0YWdnZXJzLCB2YWx1ZSlcbntcblx0ZnVuY3Rpb24gYXBwbHlUYWdnZXJzKHgpXG5cdHtcblx0XHR2YXIgdGVtcCA9IHRhZ2dlcnM7XG5cdFx0d2hpbGUgKHRlbXApXG5cdFx0e1xuXHRcdFx0eCA9IHRlbXAudGFnZ2VyKHgpO1xuXHRcdFx0dGVtcCA9IHRlbXAucmVzdDtcblx0XHR9XG5cdFx0cmV0dXJuIHg7XG5cdH1cblxuXHR2YXIgbWFwID0gaXNDbWRcblx0XHQ/IGVmZmVjdE1hbmFnZXJzW2hvbWVdLmNtZE1hcFxuXHRcdDogZWZmZWN0TWFuYWdlcnNbaG9tZV0uc3ViTWFwO1xuXG5cdHJldHVybiBBMihtYXAsIGFwcGx5VGFnZ2VycywgdmFsdWUpXG59XG5cbmZ1bmN0aW9uIGluc2VydChpc0NtZCwgbmV3RWZmZWN0LCBlZmZlY3RzKVxue1xuXHRlZmZlY3RzID0gZWZmZWN0cyB8fCB7XG5cdFx0Y21kczogX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuTmlsLFxuXHRcdHN1YnM6IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0Lk5pbFxuXHR9O1xuXHRpZiAoaXNDbWQpXG5cdHtcblx0XHRlZmZlY3RzLmNtZHMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5Db25zKG5ld0VmZmVjdCwgZWZmZWN0cy5jbWRzKTtcblx0XHRyZXR1cm4gZWZmZWN0cztcblx0fVxuXHRlZmZlY3RzLnN1YnMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5Db25zKG5ld0VmZmVjdCwgZWZmZWN0cy5zdWJzKTtcblx0cmV0dXJuIGVmZmVjdHM7XG59XG5cblxuLy8gUE9SVFNcblxuZnVuY3Rpb24gY2hlY2tQb3J0TmFtZShuYW1lKVxue1xuXHRpZiAobmFtZSBpbiBlZmZlY3RNYW5hZ2Vycylcblx0e1xuXHRcdHRocm93IG5ldyBFcnJvcignVGhlcmUgY2FuIG9ubHkgYmUgb25lIHBvcnQgbmFtZWQgYCcgKyBuYW1lICsgJ2AsIGJ1dCB5b3VyIHByb2dyYW0gaGFzIG11bHRpcGxlLicpO1xuXHR9XG59XG5cblxuLy8gT1VUR09JTkcgUE9SVFNcblxuZnVuY3Rpb24gb3V0Z29pbmdQb3J0KG5hbWUsIGNvbnZlcnRlcilcbntcblx0Y2hlY2tQb3J0TmFtZShuYW1lKTtcblx0ZWZmZWN0TWFuYWdlcnNbbmFtZV0gPSB7XG5cdFx0dGFnOiAnY21kJyxcblx0XHRjbWRNYXA6IG91dGdvaW5nUG9ydE1hcCxcblx0XHRjb252ZXJ0ZXI6IGNvbnZlcnRlcixcblx0XHRpc0ZvcmVpZ246IHRydWVcblx0fTtcblx0cmV0dXJuIGxlYWYobmFtZSk7XG59XG5cbnZhciBvdXRnb2luZ1BvcnRNYXAgPSBGMihmdW5jdGlvbiBjbWRNYXAodGFnZ2VyLCB2YWx1ZSkge1xuXHRyZXR1cm4gdmFsdWU7XG59KTtcblxuZnVuY3Rpb24gc2V0dXBPdXRnb2luZ1BvcnQobmFtZSlcbntcblx0dmFyIHN1YnMgPSBbXTtcblx0dmFyIGNvbnZlcnRlciA9IGVmZmVjdE1hbmFnZXJzW25hbWVdLmNvbnZlcnRlcjtcblxuXHQvLyBDUkVBVEUgTUFOQUdFUlxuXG5cdHZhciBpbml0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1NjaGVkdWxlci5zdWNjZWVkKG51bGwpO1xuXG5cdGZ1bmN0aW9uIG9uRWZmZWN0cyhyb3V0ZXIsIGNtZExpc3QsIHN0YXRlKVxuXHR7XG5cdFx0d2hpbGUgKGNtZExpc3QuY3RvciAhPT0gJ1tdJylcblx0XHR7XG5cdFx0XHR2YXIgdmFsdWUgPSBjb252ZXJ0ZXIoY21kTGlzdC5fMCk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN1YnMubGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHN1YnNbaV0odmFsdWUpO1xuXHRcdFx0fVxuXHRcdFx0Y21kTGlzdCA9IGNtZExpc3QuXzE7XG5cdFx0fVxuXHRcdHJldHVybiBpbml0O1xuXHR9XG5cblx0ZWZmZWN0TWFuYWdlcnNbbmFtZV0uaW5pdCA9IGluaXQ7XG5cdGVmZmVjdE1hbmFnZXJzW25hbWVdLm9uRWZmZWN0cyA9IEYzKG9uRWZmZWN0cyk7XG5cblx0Ly8gUFVCTElDIEFQSVxuXG5cdGZ1bmN0aW9uIHN1YnNjcmliZShjYWxsYmFjaylcblx0e1xuXHRcdHN1YnMucHVzaChjYWxsYmFjayk7XG5cdH1cblxuXHRmdW5jdGlvbiB1bnN1YnNjcmliZShjYWxsYmFjaylcblx0e1xuXHRcdHZhciBpbmRleCA9IHN1YnMuaW5kZXhPZihjYWxsYmFjayk7XG5cdFx0aWYgKGluZGV4ID49IDApXG5cdFx0e1xuXHRcdFx0c3Vicy5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB7XG5cdFx0c3Vic2NyaWJlOiBzdWJzY3JpYmUsXG5cdFx0dW5zdWJzY3JpYmU6IHVuc3Vic2NyaWJlXG5cdH07XG59XG5cblxuLy8gSU5DT01JTkcgUE9SVFNcblxuZnVuY3Rpb24gaW5jb21pbmdQb3J0KG5hbWUsIGNvbnZlcnRlcilcbntcblx0Y2hlY2tQb3J0TmFtZShuYW1lKTtcblx0ZWZmZWN0TWFuYWdlcnNbbmFtZV0gPSB7XG5cdFx0dGFnOiAnc3ViJyxcblx0XHRzdWJNYXA6IGluY29taW5nUG9ydE1hcCxcblx0XHRjb252ZXJ0ZXI6IGNvbnZlcnRlcixcblx0XHRpc0ZvcmVpZ246IHRydWVcblx0fTtcblx0cmV0dXJuIGxlYWYobmFtZSk7XG59XG5cbnZhciBpbmNvbWluZ1BvcnRNYXAgPSBGMihmdW5jdGlvbiBzdWJNYXAodGFnZ2VyLCBmaW5hbFRhZ2dlcilcbntcblx0cmV0dXJuIGZ1bmN0aW9uKHZhbHVlKVxuXHR7XG5cdFx0cmV0dXJuIHRhZ2dlcihmaW5hbFRhZ2dlcih2YWx1ZSkpO1xuXHR9O1xufSk7XG5cbmZ1bmN0aW9uIHNldHVwSW5jb21pbmdQb3J0KG5hbWUsIGNhbGxiYWNrKVxue1xuXHR2YXIgc2VudEJlZm9yZUluaXQgPSBbXTtcblx0dmFyIHN1YnMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5OaWw7XG5cdHZhciBjb252ZXJ0ZXIgPSBlZmZlY3RNYW5hZ2Vyc1tuYW1lXS5jb252ZXJ0ZXI7XG5cdHZhciBjdXJyZW50T25FZmZlY3RzID0gcHJlSW5pdE9uRWZmZWN0cztcblx0dmFyIGN1cnJlbnRTZW5kID0gcHJlSW5pdFNlbmQ7XG5cblx0Ly8gQ1JFQVRFIE1BTkFHRVJcblxuXHR2YXIgaW5pdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIuc3VjY2VlZChudWxsKTtcblxuXHRmdW5jdGlvbiBwcmVJbml0T25FZmZlY3RzKHJvdXRlciwgc3ViTGlzdCwgc3RhdGUpXG5cdHtcblx0XHR2YXIgcG9zdEluaXRSZXN1bHQgPSBwb3N0SW5pdE9uRWZmZWN0cyhyb3V0ZXIsIHN1Ykxpc3QsIHN0YXRlKTtcblxuXHRcdGZvcih2YXIgaSA9IDA7IGkgPCBzZW50QmVmb3JlSW5pdC5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRwb3N0SW5pdFNlbmQoc2VudEJlZm9yZUluaXRbaV0pO1xuXHRcdH1cblxuXHRcdHNlbnRCZWZvcmVJbml0ID0gbnVsbDsgLy8gdG8gcmVsZWFzZSBvYmplY3RzIGhlbGQgaW4gcXVldWVcblx0XHRjdXJyZW50U2VuZCA9IHBvc3RJbml0U2VuZDtcblx0XHRjdXJyZW50T25FZmZlY3RzID0gcG9zdEluaXRPbkVmZmVjdHM7XG5cdFx0cmV0dXJuIHBvc3RJbml0UmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gcG9zdEluaXRPbkVmZmVjdHMocm91dGVyLCBzdWJMaXN0LCBzdGF0ZSlcblx0e1xuXHRcdHN1YnMgPSBzdWJMaXN0O1xuXHRcdHJldHVybiBpbml0O1xuXHR9XG5cblx0ZnVuY3Rpb24gb25FZmZlY3RzKHJvdXRlciwgc3ViTGlzdCwgc3RhdGUpXG5cdHtcblx0XHRyZXR1cm4gY3VycmVudE9uRWZmZWN0cyhyb3V0ZXIsIHN1Ykxpc3QsIHN0YXRlKTtcblx0fVxuXG5cdGVmZmVjdE1hbmFnZXJzW25hbWVdLmluaXQgPSBpbml0O1xuXHRlZmZlY3RNYW5hZ2Vyc1tuYW1lXS5vbkVmZmVjdHMgPSBGMyhvbkVmZmVjdHMpO1xuXG5cdC8vIFBVQkxJQyBBUElcblxuXHRmdW5jdGlvbiBwcmVJbml0U2VuZCh2YWx1ZSlcblx0e1xuXHRcdHNlbnRCZWZvcmVJbml0LnB1c2godmFsdWUpO1xuXHR9XG5cblx0ZnVuY3Rpb24gcG9zdEluaXRTZW5kKGluY29taW5nVmFsdWUpXG5cdHtcblx0XHR2YXIgcmVzdWx0ID0gQTIoX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkZGVjb2RlVmFsdWUsIGNvbnZlcnRlciwgaW5jb21pbmdWYWx1ZSk7XG5cdFx0aWYgKHJlc3VsdC5jdG9yID09PSAnRXJyJylcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1RyeWluZyB0byBzZW5kIGFuIHVuZXhwZWN0ZWQgdHlwZSBvZiB2YWx1ZSB0aHJvdWdoIHBvcnQgYCcgKyBuYW1lICsgJ2A6XFxuJyArIHJlc3VsdC5fMCk7XG5cdFx0fVxuXG5cdFx0dmFyIHZhbHVlID0gcmVzdWx0Ll8wO1xuXHRcdHZhciB0ZW1wID0gc3Vicztcblx0XHR3aGlsZSAodGVtcC5jdG9yICE9PSAnW10nKVxuXHRcdHtcblx0XHRcdGNhbGxiYWNrKHRlbXAuXzAodmFsdWUpKTtcblx0XHRcdHRlbXAgPSB0ZW1wLl8xO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHNlbmQoaW5jb21pbmdWYWx1ZSlcblx0e1xuXHRcdGN1cnJlbnRTZW5kKGluY29taW5nVmFsdWUpO1xuXHR9XG5cblx0cmV0dXJuIHsgc2VuZDogc2VuZCB9O1xufVxuXG5yZXR1cm4ge1xuXHQvLyByb3V0ZXJzXG5cdHNlbmRUb0FwcDogRjIoc2VuZFRvQXBwKSxcblx0c2VuZFRvU2VsZjogRjIoc2VuZFRvU2VsZiksXG5cblx0Ly8gZ2xvYmFsIHNldHVwXG5cdG1haW5Ub1Byb2dyYW06IG1haW5Ub1Byb2dyYW0sXG5cdGVmZmVjdE1hbmFnZXJzOiBlZmZlY3RNYW5hZ2Vycyxcblx0b3V0Z29pbmdQb3J0OiBvdXRnb2luZ1BvcnQsXG5cdGluY29taW5nUG9ydDogaW5jb21pbmdQb3J0LFxuXHRhZGRQdWJsaWNNb2R1bGU6IGFkZFB1YmxpY01vZHVsZSxcblxuXHQvLyBlZmZlY3QgYmFnc1xuXHRsZWFmOiBsZWFmLFxuXHRiYXRjaDogYmF0Y2gsXG5cdG1hcDogRjIobWFwKVxufTtcblxufSgpO1xuXG52YXIgX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm0kaGFjayA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIuc3VjY2VlZDtcbnZhciBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybSRzZW5kVG9TZWxmID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1BsYXRmb3JtLnNlbmRUb1NlbGY7XG52YXIgX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm0kc2VuZFRvQXBwID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1BsYXRmb3JtLnNlbmRUb0FwcDtcbnZhciBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybSRQcm9ncmFtID0ge2N0b3I6ICdQcm9ncmFtJ307XG52YXIgX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm0kVGFzayA9IHtjdG9yOiAnVGFzayd9O1xudmFyIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtJFByb2Nlc3NJZCA9IHtjdG9yOiAnUHJvY2Vzc0lkJ307XG52YXIgX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm0kUm91dGVyID0ge2N0b3I6ICdSb3V0ZXInfTtcblxudmFyIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZCRiYXRjaCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9QbGF0Zm9ybS5iYXRjaDtcbnZhciBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWQkbm9uZSA9IF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZCRiYXRjaChcblx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFtdKSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fQ21kX29wcyA9IF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZF9vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWRfb3BzWychJ10gPSBGMihcblx0ZnVuY3Rpb24gKG1vZGVsLCBjb21tYW5kcykge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRfMDogbW9kZWwsXG5cdFx0XHRfMTogX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fQ21kJGJhdGNoKGNvbW1hbmRzKVxuXHRcdH07XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZCRtYXAgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfUGxhdGZvcm0ubWFwO1xudmFyIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZCRDbWQgPSB7Y3RvcjogJ0NtZCd9O1xuXG52YXIgX2VsbV9sYW5nJGNvcmUkUmVzdWx0JHRvTWF5YmUgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG5cdHZhciBfcDAgPSByZXN1bHQ7XG5cdGlmIChfcDAuY3RvciA9PT0gJ09rJykge1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0KF9wMC5fMCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmc7XG5cdH1cbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkUmVzdWx0JHdpdGhEZWZhdWx0ID0gRjIoXG5cdGZ1bmN0aW9uIChkZWYsIHJlc3VsdCkge1xuXHRcdHZhciBfcDEgPSByZXN1bHQ7XG5cdFx0aWYgKF9wMS5jdG9yID09PSAnT2snKSB7XG5cdFx0XHRyZXR1cm4gX3AxLl8wO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZGVmO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVyciA9IGZ1bmN0aW9uIChhKSB7XG5cdHJldHVybiB7Y3RvcjogJ0VycicsIF8wOiBhfTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkUmVzdWx0JGFuZFRoZW4gPSBGMihcblx0ZnVuY3Rpb24gKHJlc3VsdCwgY2FsbGJhY2spIHtcblx0XHR2YXIgX3AyID0gcmVzdWx0O1xuXHRcdGlmIChfcDIuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKF9wMi5fMCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKF9wMi5fMCk7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRSZXN1bHQkT2sgPSBmdW5jdGlvbiAoYSkge1xuXHRyZXR1cm4ge2N0b3I6ICdPaycsIF8wOiBhfTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkUmVzdWx0JG1hcCA9IEYyKFxuXHRmdW5jdGlvbiAoZnVuYywgcmEpIHtcblx0XHR2YXIgX3AzID0gcmE7XG5cdFx0aWYgKF9wMy5jdG9yID09PSAnT2snKSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JE9rKFxuXHRcdFx0XHRmdW5jKF9wMy5fMCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihfcDMuXzApO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkUmVzdWx0JG1hcDIgPSBGMyhcblx0ZnVuY3Rpb24gKGZ1bmMsIHJhLCByYikge1xuXHRcdHZhciBfcDQgPSB7Y3RvcjogJ19UdXBsZTInLCBfMDogcmEsIF8xOiByYn07XG5cdFx0aWYgKF9wNC5fMC5jdG9yID09PSAnT2snKSB7XG5cdFx0XHRpZiAoX3A0Ll8xLmN0b3IgPT09ICdPaycpIHtcblx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRPayhcblx0XHRcdFx0XHRBMihmdW5jLCBfcDQuXzAuXzAsIF9wNC5fMS5fMCkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoX3A0Ll8xLl8wKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoX3A0Ll8wLl8wKTtcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRtYXAzID0gRjQoXG5cdGZ1bmN0aW9uIChmdW5jLCByYSwgcmIsIHJjKSB7XG5cdFx0dmFyIF9wNSA9IHtjdG9yOiAnX1R1cGxlMycsIF8wOiByYSwgXzE6IHJiLCBfMjogcmN9O1xuXHRcdGlmIChfcDUuXzAuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0aWYgKF9wNS5fMS5jdG9yID09PSAnT2snKSB7XG5cdFx0XHRcdGlmIChfcDUuXzIuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkT2soXG5cdFx0XHRcdFx0XHRBMyhmdW5jLCBfcDUuXzAuXzAsIF9wNS5fMS5fMCwgX3A1Ll8yLl8wKSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoX3A1Ll8yLl8wKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoX3A1Ll8xLl8wKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoX3A1Ll8wLl8wKTtcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRtYXA0ID0gRjUoXG5cdGZ1bmN0aW9uIChmdW5jLCByYSwgcmIsIHJjLCByZCkge1xuXHRcdHZhciBfcDYgPSB7Y3RvcjogJ19UdXBsZTQnLCBfMDogcmEsIF8xOiByYiwgXzI6IHJjLCBfMzogcmR9O1xuXHRcdGlmIChfcDYuXzAuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0aWYgKF9wNi5fMS5jdG9yID09PSAnT2snKSB7XG5cdFx0XHRcdGlmIChfcDYuXzIuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0XHRcdGlmIChfcDYuXzMuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRPayhcblx0XHRcdFx0XHRcdFx0QTQoZnVuYywgX3A2Ll8wLl8wLCBfcDYuXzEuXzAsIF9wNi5fMi5fMCwgX3A2Ll8zLl8wKSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKF9wNi5fMy5fMCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKF9wNi5fMi5fMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKF9wNi5fMS5fMCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKF9wNi5fMC5fMCk7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRSZXN1bHQkbWFwNSA9IEY2KFxuXHRmdW5jdGlvbiAoZnVuYywgcmEsIHJiLCByYywgcmQsIHJlKSB7XG5cdFx0dmFyIF9wNyA9IHtjdG9yOiAnX1R1cGxlNScsIF8wOiByYSwgXzE6IHJiLCBfMjogcmMsIF8zOiByZCwgXzQ6IHJlfTtcblx0XHRpZiAoX3A3Ll8wLmN0b3IgPT09ICdPaycpIHtcblx0XHRcdGlmIChfcDcuXzEuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0XHRpZiAoX3A3Ll8yLmN0b3IgPT09ICdPaycpIHtcblx0XHRcdFx0XHRpZiAoX3A3Ll8zLmN0b3IgPT09ICdPaycpIHtcblx0XHRcdFx0XHRcdGlmIChfcDcuXzQuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JE9rKFxuXHRcdFx0XHRcdFx0XHRcdEE1KGZ1bmMsIF9wNy5fMC5fMCwgX3A3Ll8xLl8wLCBfcDcuXzIuXzAsIF9wNy5fMy5fMCwgX3A3Ll80Ll8wKSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihfcDcuXzQuXzApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihfcDcuXzMuXzApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihfcDcuXzIuXzApO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihfcDcuXzEuXzApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihfcDcuXzAuXzApO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkUmVzdWx0JGZvcm1hdEVycm9yID0gRjIoXG5cdGZ1bmN0aW9uIChmLCByZXN1bHQpIHtcblx0XHR2YXIgX3A4ID0gcmVzdWx0O1xuXHRcdGlmIChfcDguY3RvciA9PT0gJ09rJykge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRPayhfcDguXzApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihcblx0XHRcdFx0ZihfcDguXzApKTtcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRmcm9tTWF5YmUgPSBGMihcblx0ZnVuY3Rpb24gKGVyciwgbWF5YmUpIHtcblx0XHR2YXIgX3A5ID0gbWF5YmU7XG5cdFx0aWYgKF9wOS5jdG9yID09PSAnSnVzdCcpIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkT2soX3A5Ll8wKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoZXJyKTtcblx0XHR9XG5cdH0pO1xuXG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRvbkVycm9yID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1NjaGVkdWxlci5vbkVycm9yO1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIuYW5kVGhlbjtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJHNwYXduQ21kID0gRjIoXG5cdGZ1bmN0aW9uIChyb3V0ZXIsIF9wMCkge1xuXHRcdHZhciBfcDEgPSBfcDA7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIuc3Bhd24oXG5cdFx0XHRBMihcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0XHRfcDEuXzAsXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtJHNlbmRUb0FwcChyb3V0ZXIpKSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skZmFpbCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIuZmFpbDtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJG1hcEVycm9yID0gRjIoXG5cdGZ1bmN0aW9uIChmLCB0YXNrKSB7XG5cdFx0cmV0dXJuIEEyKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRvbkVycm9yLFxuXHRcdFx0dGFzayxcblx0XHRcdGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFRhc2skZmFpbChcblx0XHRcdFx0XHRmKGVycikpO1xuXHRcdFx0fSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skc3VjY2VlZCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIuc3VjY2VlZDtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJG1hcCA9IEYyKFxuXHRmdW5jdGlvbiAoZnVuYywgdGFza0EpIHtcblx0XHRyZXR1cm4gQTIoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJGFuZFRoZW4sXG5cdFx0XHR0YXNrQSxcblx0XHRcdGZ1bmN0aW9uIChhKSB7XG5cdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRUYXNrJHN1Y2NlZWQoXG5cdFx0XHRcdFx0ZnVuYyhhKSk7XG5cdFx0XHR9KTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRtYXAyID0gRjMoXG5cdGZ1bmN0aW9uIChmdW5jLCB0YXNrQSwgdGFza0IpIHtcblx0XHRyZXR1cm4gQTIoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJGFuZFRoZW4sXG5cdFx0XHR0YXNrQSxcblx0XHRcdGZ1bmN0aW9uIChhKSB7XG5cdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJGFuZFRoZW4sXG5cdFx0XHRcdFx0dGFza0IsXG5cdFx0XHRcdFx0ZnVuY3Rpb24gKGIpIHtcblx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRUYXNrJHN1Y2NlZWQoXG5cdFx0XHRcdFx0XHRcdEEyKGZ1bmMsIGEsIGIpKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJG1hcDMgPSBGNChcblx0ZnVuY3Rpb24gKGZ1bmMsIHRhc2tBLCB0YXNrQiwgdGFza0MpIHtcblx0XHRyZXR1cm4gQTIoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJGFuZFRoZW4sXG5cdFx0XHR0YXNrQSxcblx0XHRcdGZ1bmN0aW9uIChhKSB7XG5cdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJGFuZFRoZW4sXG5cdFx0XHRcdFx0dGFza0IsXG5cdFx0XHRcdFx0ZnVuY3Rpb24gKGIpIHtcblx0XHRcdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0XHRcdFx0XHR0YXNrQyxcblx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKGMpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRzdWNjZWVkKFxuXHRcdFx0XHRcdFx0XHRcdFx0QTMoZnVuYywgYSwgYiwgYykpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJG1hcDQgPSBGNShcblx0ZnVuY3Rpb24gKGZ1bmMsIHRhc2tBLCB0YXNrQiwgdGFza0MsIHRhc2tEKSB7XG5cdFx0cmV0dXJuIEEyKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0dGFza0EsXG5cdFx0XHRmdW5jdGlvbiAoYSkge1xuXHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0XHRcdHRhc2tCLFxuXHRcdFx0XHRcdGZ1bmN0aW9uIChiKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbixcblx0XHRcdFx0XHRcdFx0dGFza0MsXG5cdFx0XHRcdFx0XHRcdGZ1bmN0aW9uIChjKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIEEyKFxuXHRcdFx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0XHRcdFx0XHRcdFx0dGFza0QsXG5cdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAoZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRzdWNjZWVkKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdEE0KGZ1bmMsIGEsIGIsIGMsIGQpKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJG1hcDUgPSBGNihcblx0ZnVuY3Rpb24gKGZ1bmMsIHRhc2tBLCB0YXNrQiwgdGFza0MsIHRhc2tELCB0YXNrRSkge1xuXHRcdHJldHVybiBBMihcblx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbixcblx0XHRcdHRhc2tBLFxuXHRcdFx0ZnVuY3Rpb24gKGEpIHtcblx0XHRcdFx0cmV0dXJuIEEyKFxuXHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbixcblx0XHRcdFx0XHR0YXNrQixcblx0XHRcdFx0XHRmdW5jdGlvbiAoYikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIEEyKFxuXHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJGFuZFRoZW4sXG5cdFx0XHRcdFx0XHRcdHRhc2tDLFxuXHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAoYykge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbixcblx0XHRcdFx0XHRcdFx0XHRcdHRhc2tELFxuXHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKGQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIEEyKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0YXNrRSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFRhc2skc3VjY2VlZChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0QTUoZnVuYywgYSwgYiwgYywgZCwgZSkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kTWFwID0gRjIoXG5cdGZ1bmN0aW9uICh0YXNrRnVuYywgdGFza1ZhbHVlKSB7XG5cdFx0cmV0dXJuIEEyKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0dGFza0Z1bmMsXG5cdFx0XHRmdW5jdGlvbiAoZnVuYykge1xuXHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0XHRcdHRhc2tWYWx1ZSxcblx0XHRcdFx0XHRmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRUYXNrJHN1Y2NlZWQoXG5cdFx0XHRcdFx0XHRcdGZ1bmModmFsdWUpKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJHNlcXVlbmNlID0gZnVuY3Rpb24gKHRhc2tzKSB7XG5cdHZhciBfcDIgPSB0YXNrcztcblx0aWYgKF9wMi5jdG9yID09PSAnW10nKSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFRhc2skc3VjY2VlZChcblx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0W10pKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gQTMoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJG1hcDIsXG5cdFx0XHRGMihcblx0XHRcdFx0ZnVuY3Rpb24gKHgsIHkpIHtcblx0XHRcdFx0XHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIHgsIHkpO1xuXHRcdFx0XHR9KSxcblx0XHRcdF9wMi5fMCxcblx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skc2VxdWVuY2UoX3AyLl8xKSk7XG5cdH1cbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRvbkVmZmVjdHMgPSBGMyhcblx0ZnVuY3Rpb24gKHJvdXRlciwgY29tbWFuZHMsIHN0YXRlKSB7XG5cdFx0cmV0dXJuIEEyKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRtYXAsXG5cdFx0XHRmdW5jdGlvbiAoX3AzKSB7XG5cdFx0XHRcdHJldHVybiB7Y3RvcjogJ19UdXBsZTAnfTtcblx0XHRcdH0sXG5cdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJHNlcXVlbmNlKFxuXHRcdFx0XHRBMihcblx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0JG1hcCxcblx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJHNwYXduQ21kKHJvdXRlciksXG5cdFx0XHRcdFx0Y29tbWFuZHMpKSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skdG9NYXliZSA9IGZ1bmN0aW9uICh0YXNrKSB7XG5cdHJldHVybiBBMihcblx0XHRfZWxtX2xhbmckY29yZSRUYXNrJG9uRXJyb3IsXG5cdFx0QTIoX2VsbV9sYW5nJGNvcmUkVGFzayRtYXAsIF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QsIHRhc2spLFxuXHRcdGZ1bmN0aW9uIChfcDQpIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRUYXNrJHN1Y2NlZWQoX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZyk7XG5cdFx0fSk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skZnJvbU1heWJlID0gRjIoXG5cdGZ1bmN0aW9uICgkZGVmYXVsdCwgbWF5YmUpIHtcblx0XHR2YXIgX3A1ID0gbWF5YmU7XG5cdFx0aWYgKF9wNS5jdG9yID09PSAnSnVzdCcpIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRUYXNrJHN1Y2NlZWQoX3A1Ll8wKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFRhc2skZmFpbCgkZGVmYXVsdCk7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJHRvUmVzdWx0ID0gZnVuY3Rpb24gKHRhc2spIHtcblx0cmV0dXJuIEEyKFxuXHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skb25FcnJvcixcblx0XHRBMihfZWxtX2xhbmckY29yZSRUYXNrJG1hcCwgX2VsbV9sYW5nJGNvcmUkUmVzdWx0JE9rLCB0YXNrKSxcblx0XHRmdW5jdGlvbiAobXNnKSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRzdWNjZWVkKFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKG1zZykpO1xuXHRcdH0pO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJGZyb21SZXN1bHQgPSBmdW5jdGlvbiAocmVzdWx0KSB7XG5cdHZhciBfcDYgPSByZXN1bHQ7XG5cdGlmIChfcDYuY3RvciA9PT0gJ09rJykge1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRUYXNrJHN1Y2NlZWQoX3A2Ll8wKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRmYWlsKF9wNi5fMCk7XG5cdH1cbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRpbml0ID0gX2VsbV9sYW5nJGNvcmUkVGFzayRzdWNjZWVkKFxuXHR7Y3RvcjogJ19UdXBsZTAnfSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRvblNlbGZNc2cgPSBGMyhcblx0ZnVuY3Rpb24gKF9wOSwgX3A4LCBfcDcpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRzdWNjZWVkKFxuXHRcdFx0e2N0b3I6ICdfVHVwbGUwJ30pO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJGNvbW1hbmQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfUGxhdGZvcm0ubGVhZignVGFzaycpO1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skVCA9IGZ1bmN0aW9uIChhKSB7XG5cdHJldHVybiB7Y3RvcjogJ1QnLCBfMDogYX07XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skcGVyZm9ybSA9IEYzKFxuXHRmdW5jdGlvbiAob25GYWlsLCBvblN1Y2Nlc3MsIHRhc2spIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRjb21tYW5kKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRUKFxuXHRcdFx0XHRBMihcblx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJG9uRXJyb3IsXG5cdFx0XHRcdFx0QTIoX2VsbV9sYW5nJGNvcmUkVGFzayRtYXAsIG9uU3VjY2VzcywgdGFzayksXG5cdFx0XHRcdFx0ZnVuY3Rpb24gKHgpIHtcblx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRUYXNrJHN1Y2NlZWQoXG5cdFx0XHRcdFx0XHRcdG9uRmFpbCh4KSk7XG5cdFx0XHRcdFx0fSkpKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRjbWRNYXAgPSBGMihcblx0ZnVuY3Rpb24gKHRhZ2dlciwgX3AxMCkge1xuXHRcdHZhciBfcDExID0gX3AxMDtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRUKFxuXHRcdFx0QTIoX2VsbV9sYW5nJGNvcmUkVGFzayRtYXAsIHRhZ2dlciwgX3AxMS5fMCkpO1xuXHR9KTtcbl9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9QbGF0Zm9ybS5lZmZlY3RNYW5hZ2Vyc1snVGFzayddID0ge3BrZzogJ2VsbS1sYW5nL2NvcmUnLCBpbml0OiBfZWxtX2xhbmckY29yZSRUYXNrJGluaXQsIG9uRWZmZWN0czogX2VsbV9sYW5nJGNvcmUkVGFzayRvbkVmZmVjdHMsIG9uU2VsZk1zZzogX2VsbV9sYW5nJGNvcmUkVGFzayRvblNlbGZNc2csIHRhZzogJ2NtZCcsIGNtZE1hcDogX2VsbV9sYW5nJGNvcmUkVGFzayRjbWRNYXB9O1xuXG4vL2ltcG9ydCBOYXRpdmUuVXRpbHMgLy9cblxudmFyIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9EZWJ1ZyA9IGZ1bmN0aW9uKCkge1xuXG5mdW5jdGlvbiBsb2codGFnLCB2YWx1ZSlcbntcblx0dmFyIG1zZyA9IHRhZyArICc6ICcgKyBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMudG9TdHJpbmcodmFsdWUpO1xuXHR2YXIgcHJvY2VzcyA9IHByb2Nlc3MgfHwge307XG5cdGlmIChwcm9jZXNzLnN0ZG91dClcblx0e1xuXHRcdHByb2Nlc3Muc3Rkb3V0LndyaXRlKG1zZyk7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0Y29uc29sZS5sb2cobXNnKTtcblx0fVxuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNyYXNoKG1lc3NhZ2UpXG57XG5cdHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbn1cblxucmV0dXJuIHtcblx0Y3Jhc2g6IGNyYXNoLFxuXHRsb2c6IEYyKGxvZylcbn07XG5cbn0oKTtcbi8vaW1wb3J0IE1heWJlLCBOYXRpdmUuTGlzdCwgTmF0aXZlLlV0aWxzLCBSZXN1bHQgLy9cblxudmFyIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcgPSBmdW5jdGlvbigpIHtcblxuZnVuY3Rpb24gaXNFbXB0eShzdHIpXG57XG5cdHJldHVybiBzdHIubGVuZ3RoID09PSAwO1xufVxuZnVuY3Rpb24gY29ucyhjaHIsIHN0cilcbntcblx0cmV0dXJuIGNociArIHN0cjtcbn1cbmZ1bmN0aW9uIHVuY29ucyhzdHIpXG57XG5cdHZhciBoZCA9IHN0clswXTtcblx0aWYgKGhkKVxuXHR7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLlR1cGxlMihfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKGhkKSwgc3RyLnNsaWNlKDEpKSk7XG5cdH1cblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmc7XG59XG5mdW5jdGlvbiBhcHBlbmQoYSwgYilcbntcblx0cmV0dXJuIGEgKyBiO1xufVxuZnVuY3Rpb24gY29uY2F0KHN0cnMpXG57XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC50b0FycmF5KHN0cnMpLmpvaW4oJycpO1xufVxuZnVuY3Rpb24gbGVuZ3RoKHN0cilcbntcblx0cmV0dXJuIHN0ci5sZW5ndGg7XG59XG5mdW5jdGlvbiBtYXAoZiwgc3RyKVxue1xuXHR2YXIgb3V0ID0gc3RyLnNwbGl0KCcnKTtcblx0Zm9yICh2YXIgaSA9IG91dC5sZW5ndGg7IGktLTsgKVxuXHR7XG5cdFx0b3V0W2ldID0gZihfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKG91dFtpXSkpO1xuXHR9XG5cdHJldHVybiBvdXQuam9pbignJyk7XG59XG5mdW5jdGlvbiBmaWx0ZXIocHJlZCwgc3RyKVxue1xuXHRyZXR1cm4gc3RyLnNwbGl0KCcnKS5tYXAoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocikuZmlsdGVyKHByZWQpLmpvaW4oJycpO1xufVxuZnVuY3Rpb24gcmV2ZXJzZShzdHIpXG57XG5cdHJldHVybiBzdHIuc3BsaXQoJycpLnJldmVyc2UoKS5qb2luKCcnKTtcbn1cbmZ1bmN0aW9uIGZvbGRsKGYsIGIsIHN0cilcbntcblx0dmFyIGxlbiA9IHN0ci5sZW5ndGg7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG5cdHtcblx0XHRiID0gQTIoZiwgX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocihzdHJbaV0pLCBiKTtcblx0fVxuXHRyZXR1cm4gYjtcbn1cbmZ1bmN0aW9uIGZvbGRyKGYsIGIsIHN0cilcbntcblx0Zm9yICh2YXIgaSA9IHN0ci5sZW5ndGg7IGktLTsgKVxuXHR7XG5cdFx0YiA9IEEyKGYsIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoc3RyW2ldKSwgYik7XG5cdH1cblx0cmV0dXJuIGI7XG59XG5mdW5jdGlvbiBzcGxpdChzZXAsIHN0cilcbntcblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShzdHIuc3BsaXQoc2VwKSk7XG59XG5mdW5jdGlvbiBqb2luKHNlcCwgc3Rycylcbntcblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LnRvQXJyYXkoc3Rycykuam9pbihzZXApO1xufVxuZnVuY3Rpb24gcmVwZWF0KG4sIHN0cilcbntcblx0dmFyIHJlc3VsdCA9ICcnO1xuXHR3aGlsZSAobiA+IDApXG5cdHtcblx0XHRpZiAobiAmIDEpXG5cdFx0e1xuXHRcdFx0cmVzdWx0ICs9IHN0cjtcblx0XHR9XG5cdFx0biA+Pj0gMSwgc3RyICs9IHN0cjtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gc2xpY2Uoc3RhcnQsIGVuZCwgc3RyKVxue1xuXHRyZXR1cm4gc3RyLnNsaWNlKHN0YXJ0LCBlbmQpO1xufVxuZnVuY3Rpb24gbGVmdChuLCBzdHIpXG57XG5cdHJldHVybiBuIDwgMSA/ICcnIDogc3RyLnNsaWNlKDAsIG4pO1xufVxuZnVuY3Rpb24gcmlnaHQobiwgc3RyKVxue1xuXHRyZXR1cm4gbiA8IDEgPyAnJyA6IHN0ci5zbGljZSgtbik7XG59XG5mdW5jdGlvbiBkcm9wTGVmdChuLCBzdHIpXG57XG5cdHJldHVybiBuIDwgMSA/IHN0ciA6IHN0ci5zbGljZShuKTtcbn1cbmZ1bmN0aW9uIGRyb3BSaWdodChuLCBzdHIpXG57XG5cdHJldHVybiBuIDwgMSA/IHN0ciA6IHN0ci5zbGljZSgwLCAtbik7XG59XG5mdW5jdGlvbiBwYWQobiwgY2hyLCBzdHIpXG57XG5cdHZhciBoYWxmID0gKG4gLSBzdHIubGVuZ3RoKSAvIDI7XG5cdHJldHVybiByZXBlYXQoTWF0aC5jZWlsKGhhbGYpLCBjaHIpICsgc3RyICsgcmVwZWF0KGhhbGYgfCAwLCBjaHIpO1xufVxuZnVuY3Rpb24gcGFkUmlnaHQobiwgY2hyLCBzdHIpXG57XG5cdHJldHVybiBzdHIgKyByZXBlYXQobiAtIHN0ci5sZW5ndGgsIGNocik7XG59XG5mdW5jdGlvbiBwYWRMZWZ0KG4sIGNociwgc3RyKVxue1xuXHRyZXR1cm4gcmVwZWF0KG4gLSBzdHIubGVuZ3RoLCBjaHIpICsgc3RyO1xufVxuXG5mdW5jdGlvbiB0cmltKHN0cilcbntcblx0cmV0dXJuIHN0ci50cmltKCk7XG59XG5mdW5jdGlvbiB0cmltTGVmdChzdHIpXG57XG5cdHJldHVybiBzdHIucmVwbGFjZSgvXlxccysvLCAnJyk7XG59XG5mdW5jdGlvbiB0cmltUmlnaHQoc3RyKVxue1xuXHRyZXR1cm4gc3RyLnJlcGxhY2UoL1xccyskLywgJycpO1xufVxuXG5mdW5jdGlvbiB3b3JkcyhzdHIpXG57XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoc3RyLnRyaW0oKS5zcGxpdCgvXFxzKy9nKSk7XG59XG5mdW5jdGlvbiBsaW5lcyhzdHIpXG57XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoc3RyLnNwbGl0KC9cXHJcXG58XFxyfFxcbi9nKSk7XG59XG5cbmZ1bmN0aW9uIHRvVXBwZXIoc3RyKVxue1xuXHRyZXR1cm4gc3RyLnRvVXBwZXJDYXNlKCk7XG59XG5mdW5jdGlvbiB0b0xvd2VyKHN0cilcbntcblx0cmV0dXJuIHN0ci50b0xvd2VyQ2FzZSgpO1xufVxuXG5mdW5jdGlvbiBhbnkocHJlZCwgc3RyKVxue1xuXHRmb3IgKHZhciBpID0gc3RyLmxlbmd0aDsgaS0tOyApXG5cdHtcblx0XHRpZiAocHJlZChfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKHN0cltpXSkpKVxuXHRcdHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiBhbGwocHJlZCwgc3RyKVxue1xuXHRmb3IgKHZhciBpID0gc3RyLmxlbmd0aDsgaS0tOyApXG5cdHtcblx0XHRpZiAoIXByZWQoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocihzdHJbaV0pKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBjb250YWlucyhzdWIsIHN0cilcbntcblx0cmV0dXJuIHN0ci5pbmRleE9mKHN1YikgPiAtMTtcbn1cbmZ1bmN0aW9uIHN0YXJ0c1dpdGgoc3ViLCBzdHIpXG57XG5cdHJldHVybiBzdHIuaW5kZXhPZihzdWIpID09PSAwO1xufVxuZnVuY3Rpb24gZW5kc1dpdGgoc3ViLCBzdHIpXG57XG5cdHJldHVybiBzdHIubGVuZ3RoID49IHN1Yi5sZW5ndGggJiZcblx0XHRzdHIubGFzdEluZGV4T2Yoc3ViKSA9PT0gc3RyLmxlbmd0aCAtIHN1Yi5sZW5ndGg7XG59XG5mdW5jdGlvbiBpbmRleGVzKHN1Yiwgc3RyKVxue1xuXHR2YXIgc3ViTGVuID0gc3ViLmxlbmd0aDtcblx0XG5cdGlmIChzdWJMZW4gPCAxKVxuXHR7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0Lk5pbDtcblx0fVxuXG5cdHZhciBpID0gMDtcblx0dmFyIGlzID0gW107XG5cblx0d2hpbGUgKChpID0gc3RyLmluZGV4T2Yoc3ViLCBpKSkgPiAtMSlcblx0e1xuXHRcdGlzLnB1c2goaSk7XG5cdFx0aSA9IGkgKyBzdWJMZW47XG5cdH1cdFxuXHRcblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShpcyk7XG59XG5cbmZ1bmN0aW9uIHRvSW50KHMpXG57XG5cdHZhciBsZW4gPSBzLmxlbmd0aDtcblx0aWYgKGxlbiA9PT0gMClcblx0e1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKFwiY291bGQgbm90IGNvbnZlcnQgc3RyaW5nICdcIiArIHMgKyBcIicgdG8gYW4gSW50XCIgKTtcblx0fVxuXHR2YXIgc3RhcnQgPSAwO1xuXHRpZiAoc1swXSA9PT0gJy0nKVxuXHR7XG5cdFx0aWYgKGxlbiA9PT0gMSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihcImNvdWxkIG5vdCBjb252ZXJ0IHN0cmluZyAnXCIgKyBzICsgXCInIHRvIGFuIEludFwiICk7XG5cdFx0fVxuXHRcdHN0YXJ0ID0gMTtcblx0fVxuXHRmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBsZW47ICsraSlcblx0e1xuXHRcdHZhciBjID0gc1tpXTtcblx0XHRpZiAoYyA8ICcwJyB8fCAnOScgPCBjKVxuXHRcdHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKFwiY291bGQgbm90IGNvbnZlcnQgc3RyaW5nICdcIiArIHMgKyBcIicgdG8gYW4gSW50XCIgKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRPayhwYXJzZUludChzLCAxMCkpO1xufVxuXG5mdW5jdGlvbiB0b0Zsb2F0KHMpXG57XG5cdHZhciBsZW4gPSBzLmxlbmd0aDtcblx0aWYgKGxlbiA9PT0gMClcblx0e1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKFwiY291bGQgbm90IGNvbnZlcnQgc3RyaW5nICdcIiArIHMgKyBcIicgdG8gYSBGbG9hdFwiICk7XG5cdH1cblx0dmFyIHN0YXJ0ID0gMDtcblx0aWYgKHNbMF0gPT09ICctJylcblx0e1xuXHRcdGlmIChsZW4gPT09IDEpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoXCJjb3VsZCBub3QgY29udmVydCBzdHJpbmcgJ1wiICsgcyArIFwiJyB0byBhIEZsb2F0XCIgKTtcblx0XHR9XG5cdFx0c3RhcnQgPSAxO1xuXHR9XG5cdHZhciBkb3RDb3VudCA9IDA7XG5cdGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGxlbjsgKytpKVxuXHR7XG5cdFx0dmFyIGMgPSBzW2ldO1xuXHRcdGlmICgnMCcgPD0gYyAmJiBjIDw9ICc5Jylcblx0XHR7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cdFx0aWYgKGMgPT09ICcuJylcblx0XHR7XG5cdFx0XHRkb3RDb3VudCArPSAxO1xuXHRcdFx0aWYgKGRvdENvdW50IDw9IDEpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihcImNvdWxkIG5vdCBjb252ZXJ0IHN0cmluZyAnXCIgKyBzICsgXCInIHRvIGEgRmxvYXRcIiApO1xuXHR9XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkT2socGFyc2VGbG9hdChzKSk7XG59XG5cbmZ1bmN0aW9uIHRvTGlzdChzdHIpXG57XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoc3RyLnNwbGl0KCcnKS5tYXAoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocikpO1xufVxuZnVuY3Rpb24gZnJvbUxpc3QoY2hhcnMpXG57XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC50b0FycmF5KGNoYXJzKS5qb2luKCcnKTtcbn1cblxucmV0dXJuIHtcblx0aXNFbXB0eTogaXNFbXB0eSxcblx0Y29uczogRjIoY29ucyksXG5cdHVuY29uczogdW5jb25zLFxuXHRhcHBlbmQ6IEYyKGFwcGVuZCksXG5cdGNvbmNhdDogY29uY2F0LFxuXHRsZW5ndGg6IGxlbmd0aCxcblx0bWFwOiBGMihtYXApLFxuXHRmaWx0ZXI6IEYyKGZpbHRlciksXG5cdHJldmVyc2U6IHJldmVyc2UsXG5cdGZvbGRsOiBGMyhmb2xkbCksXG5cdGZvbGRyOiBGMyhmb2xkciksXG5cblx0c3BsaXQ6IEYyKHNwbGl0KSxcblx0am9pbjogRjIoam9pbiksXG5cdHJlcGVhdDogRjIocmVwZWF0KSxcblxuXHRzbGljZTogRjMoc2xpY2UpLFxuXHRsZWZ0OiBGMihsZWZ0KSxcblx0cmlnaHQ6IEYyKHJpZ2h0KSxcblx0ZHJvcExlZnQ6IEYyKGRyb3BMZWZ0KSxcblx0ZHJvcFJpZ2h0OiBGMihkcm9wUmlnaHQpLFxuXG5cdHBhZDogRjMocGFkKSxcblx0cGFkTGVmdDogRjMocGFkTGVmdCksXG5cdHBhZFJpZ2h0OiBGMyhwYWRSaWdodCksXG5cblx0dHJpbTogdHJpbSxcblx0dHJpbUxlZnQ6IHRyaW1MZWZ0LFxuXHR0cmltUmlnaHQ6IHRyaW1SaWdodCxcblxuXHR3b3Jkczogd29yZHMsXG5cdGxpbmVzOiBsaW5lcyxcblxuXHR0b1VwcGVyOiB0b1VwcGVyLFxuXHR0b0xvd2VyOiB0b0xvd2VyLFxuXG5cdGFueTogRjIoYW55KSxcblx0YWxsOiBGMihhbGwpLFxuXG5cdGNvbnRhaW5zOiBGMihjb250YWlucyksXG5cdHN0YXJ0c1dpdGg6IEYyKHN0YXJ0c1dpdGgpLFxuXHRlbmRzV2l0aDogRjIoZW5kc1dpdGgpLFxuXHRpbmRleGVzOiBGMihpbmRleGVzKSxcblxuXHR0b0ludDogdG9JbnQsXG5cdHRvRmxvYXQ6IHRvRmxvYXQsXG5cdHRvTGlzdDogdG9MaXN0LFxuXHRmcm9tTGlzdDogZnJvbUxpc3Rcbn07XG5cbn0oKTtcblxudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRmcm9tTGlzdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcuZnJvbUxpc3Q7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHRvTGlzdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcudG9MaXN0O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyR0b0Zsb2F0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy50b0Zsb2F0O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyR0b0ludCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcudG9JbnQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGluZGljZXMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmluZGV4ZXM7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGluZGV4ZXMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmluZGV4ZXM7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGVuZHNXaXRoID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5lbmRzV2l0aDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckc3RhcnRzV2l0aCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcuc3RhcnRzV2l0aDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckY29udGFpbnMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmNvbnRhaW5zO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRhbGwgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmFsbDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckYW55ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5hbnk7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHRvTG93ZXIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLnRvTG93ZXI7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHRvVXBwZXIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLnRvVXBwZXI7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGxpbmVzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5saW5lcztcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckd29yZHMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLndvcmRzO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyR0cmltUmlnaHQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLnRyaW1SaWdodDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckdHJpbUxlZnQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLnRyaW1MZWZ0O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyR0cmltID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy50cmltO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRwYWRSaWdodCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcucGFkUmlnaHQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHBhZExlZnQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLnBhZExlZnQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHBhZCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcucGFkO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRkcm9wUmlnaHQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmRyb3BSaWdodDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckZHJvcExlZnQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmRyb3BMZWZ0O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRyaWdodCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcucmlnaHQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGxlZnQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmxlZnQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHNsaWNlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5zbGljZTtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckcmVwZWF0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5yZXBlYXQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGpvaW4gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmpvaW47XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHNwbGl0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5zcGxpdDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckZm9sZHIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmZvbGRyO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRmb2xkbCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcuZm9sZGw7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHJldmVyc2UgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLnJldmVyc2U7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGZpbHRlciA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcuZmlsdGVyO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRtYXAgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLm1hcDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckbGVuZ3RoID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5sZW5ndGg7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGNvbmNhdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcuY29uY2F0O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRhcHBlbmQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmFwcGVuZDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckdW5jb25zID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy51bmNvbnM7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGNvbnMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmNvbnM7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGZyb21DaGFyID0gZnVuY3Rpb24gKCRjaGFyKSB7XG5cdHJldHVybiBBMihfZWxtX2xhbmckY29yZSRTdHJpbmckY29ucywgJGNoYXIsICcnKTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGlzRW1wdHkgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmlzRW1wdHk7XG5cbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGZvbGRyID0gRjMoXG5cdGZ1bmN0aW9uIChmLCBhY2MsIHQpIHtcblx0XHRmb2xkcjpcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0dmFyIF9wMCA9IHQ7XG5cdFx0XHRpZiAoX3AwLmN0b3IgPT09ICdSQkVtcHR5X2VsbV9idWlsdGluJykge1xuXHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIF92MSA9IGYsXG5cdFx0XHRcdFx0X3YyID0gQTMoXG5cdFx0XHRcdFx0Zixcblx0XHRcdFx0XHRfcDAuXzEsXG5cdFx0XHRcdFx0X3AwLl8yLFxuXHRcdFx0XHRcdEEzKF9lbG1fbGFuZyRjb3JlJERpY3QkZm9sZHIsIGYsIGFjYywgX3AwLl80KSksXG5cdFx0XHRcdFx0X3YzID0gX3AwLl8zO1xuXHRcdFx0XHRmID0gX3YxO1xuXHRcdFx0XHRhY2MgPSBfdjI7XG5cdFx0XHRcdHQgPSBfdjM7XG5cdFx0XHRcdGNvbnRpbnVlIGZvbGRyO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRrZXlzID0gZnVuY3Rpb24gKGRpY3QpIHtcblx0cmV0dXJuIEEzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkZm9sZHIsXG5cdFx0RjMoXG5cdFx0XHRmdW5jdGlvbiAoa2V5LCB2YWx1ZSwga2V5TGlzdCkge1xuXHRcdFx0XHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIGtleSwga2V5TGlzdCk7XG5cdFx0XHR9KSxcblx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRbXSksXG5cdFx0ZGljdCk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkdmFsdWVzID0gZnVuY3Rpb24gKGRpY3QpIHtcblx0cmV0dXJuIEEzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkZm9sZHIsXG5cdFx0RjMoXG5cdFx0XHRmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgdmFsdWVMaXN0KSB7XG5cdFx0XHRcdHJldHVybiBBMihfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSwgdmFsdWUsIHZhbHVlTGlzdCk7XG5cdFx0XHR9KSxcblx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRbXSksXG5cdFx0ZGljdCk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkdG9MaXN0ID0gZnVuY3Rpb24gKGRpY3QpIHtcblx0cmV0dXJuIEEzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkZm9sZHIsXG5cdFx0RjMoXG5cdFx0XHRmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgbGlzdCkge1xuXHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sXG5cdFx0XHRcdFx0e2N0b3I6ICdfVHVwbGUyJywgXzA6IGtleSwgXzE6IHZhbHVlfSxcblx0XHRcdFx0XHRsaXN0KTtcblx0XHRcdH0pLFxuXHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFtdKSxcblx0XHRkaWN0KTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRmb2xkbCA9IEYzKFxuXHRmdW5jdGlvbiAoZiwgYWNjLCBkaWN0KSB7XG5cdFx0Zm9sZGw6XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdHZhciBfcDEgPSBkaWN0O1xuXHRcdFx0aWYgKF9wMS5jdG9yID09PSAnUkJFbXB0eV9lbG1fYnVpbHRpbicpIHtcblx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBfdjUgPSBmLFxuXHRcdFx0XHRcdF92NiA9IEEzKFxuXHRcdFx0XHRcdGYsXG5cdFx0XHRcdFx0X3AxLl8xLFxuXHRcdFx0XHRcdF9wMS5fMixcblx0XHRcdFx0XHRBMyhfZWxtX2xhbmckY29yZSREaWN0JGZvbGRsLCBmLCBhY2MsIF9wMS5fMykpLFxuXHRcdFx0XHRcdF92NyA9IF9wMS5fNDtcblx0XHRcdFx0ZiA9IF92NTtcblx0XHRcdFx0YWNjID0gX3Y2O1xuXHRcdFx0XHRkaWN0ID0gX3Y3O1xuXHRcdFx0XHRjb250aW51ZSBmb2xkbDtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkbWVyZ2UgPSBGNihcblx0ZnVuY3Rpb24gKGxlZnRTdGVwLCBib3RoU3RlcCwgcmlnaHRTdGVwLCBsZWZ0RGljdCwgcmlnaHREaWN0LCBpbml0aWFsUmVzdWx0KSB7XG5cdFx0dmFyIHN0ZXBTdGF0ZSA9IEYzKFxuXHRcdFx0ZnVuY3Rpb24gKHJLZXksIHJWYWx1ZSwgX3AyKSB7XG5cdFx0XHRcdHN0ZXBTdGF0ZTpcblx0XHRcdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdFx0XHR2YXIgX3AzID0gX3AyO1xuXHRcdFx0XHRcdHZhciBfcDkgPSBfcDMuXzE7XG5cdFx0XHRcdFx0dmFyIF9wOCA9IF9wMy5fMDtcblx0XHRcdFx0XHR2YXIgX3A0ID0gX3A4O1xuXHRcdFx0XHRcdGlmIChfcDQuY3RvciA9PT0gJ1tdJykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdFx0XHRfMDogX3A4LFxuXHRcdFx0XHRcdFx0XHRfMTogQTMocmlnaHRTdGVwLCByS2V5LCByVmFsdWUsIF9wOSlcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHZhciBfcDcgPSBfcDQuXzE7XG5cdFx0XHRcdFx0XHR2YXIgX3A2ID0gX3A0Ll8wLl8xO1xuXHRcdFx0XHRcdFx0dmFyIF9wNSA9IF9wNC5fMC5fMDtcblx0XHRcdFx0XHRcdGlmIChfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY21wKF9wNSwgcktleSkgPCAwKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBfdjEwID0gcktleSxcblx0XHRcdFx0XHRcdFx0XHRfdjExID0gclZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcdF92MTIgPSB7XG5cdFx0XHRcdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdFx0XHRcdF8wOiBfcDcsXG5cdFx0XHRcdFx0XHRcdFx0XzE6IEEzKGxlZnRTdGVwLCBfcDUsIF9wNiwgX3A5KVxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRyS2V5ID0gX3YxMDtcblx0XHRcdFx0XHRcdFx0clZhbHVlID0gX3YxMTtcblx0XHRcdFx0XHRcdFx0X3AyID0gX3YxMjtcblx0XHRcdFx0XHRcdFx0Y29udGludWUgc3RlcFN0YXRlO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0aWYgKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jbXAoX3A1LCByS2V5KSA+IDApIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdFx0XHRcdFx0XzA6IF9wOCxcblx0XHRcdFx0XHRcdFx0XHRcdF8xOiBBMyhyaWdodFN0ZXAsIHJLZXksIHJWYWx1ZSwgX3A5KVxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRcdFx0XHRcdF8wOiBfcDcsXG5cdFx0XHRcdFx0XHRcdFx0XHRfMTogQTQoYm90aFN0ZXAsIF9wNSwgX3A2LCByVmFsdWUsIF9wOSlcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR2YXIgX3AxMCA9IEEzKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRmb2xkbCxcblx0XHRcdHN0ZXBTdGF0ZSxcblx0XHRcdHtcblx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRfMDogX2VsbV9sYW5nJGNvcmUkRGljdCR0b0xpc3QobGVmdERpY3QpLFxuXHRcdFx0XHRfMTogaW5pdGlhbFJlc3VsdFxuXHRcdFx0fSxcblx0XHRcdHJpZ2h0RGljdCk7XG5cdFx0dmFyIGxlZnRvdmVycyA9IF9wMTAuXzA7XG5cdFx0dmFyIGludGVybWVkaWF0ZVJlc3VsdCA9IF9wMTAuXzE7XG5cdFx0cmV0dXJuIEEzKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkbCxcblx0XHRcdEYyKFxuXHRcdFx0XHRmdW5jdGlvbiAoX3AxMSwgcmVzdWx0KSB7XG5cdFx0XHRcdFx0dmFyIF9wMTIgPSBfcDExO1xuXHRcdFx0XHRcdHJldHVybiBBMyhsZWZ0U3RlcCwgX3AxMi5fMCwgX3AxMi5fMSwgcmVzdWx0KTtcblx0XHRcdFx0fSksXG5cdFx0XHRpbnRlcm1lZGlhdGVSZXN1bHQsXG5cdFx0XHRsZWZ0b3ZlcnMpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JHJlcG9ydFJlbUJ1ZyA9IEY0KFxuXHRmdW5jdGlvbiAobXNnLCBjLCBsZ290LCByZ290KSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9EZWJ1Zy5jcmFzaChcblx0XHRcdF9lbG1fbGFuZyRjb3JlJFN0cmluZyRjb25jYXQoXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0XHRbXG5cdFx0XHRcdFx0XHQnSW50ZXJuYWwgcmVkLWJsYWNrIHRyZWUgaW52YXJpYW50IHZpb2xhdGVkLCBleHBlY3RlZCAnLFxuXHRcdFx0XHRcdFx0bXNnLFxuXHRcdFx0XHRcdFx0JyBhbmQgZ290ICcsXG5cdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRCYXNpY3MkdG9TdHJpbmcoYyksXG5cdFx0XHRcdFx0XHQnLycsXG5cdFx0XHRcdFx0XHRsZ290LFxuXHRcdFx0XHRcdFx0Jy8nLFxuXHRcdFx0XHRcdFx0cmdvdCxcblx0XHRcdFx0XHRcdCdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgYnVnIHRvIDxodHRwczovL2dpdGh1Yi5jb20vZWxtLWxhbmcvY29yZS9pc3N1ZXM+J1xuXHRcdFx0XHRcdF0pKSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkaXNCQmxhY2sgPSBmdW5jdGlvbiAoZGljdCkge1xuXHR2YXIgX3AxMyA9IGRpY3Q7XG5cdF92MTRfMjpcblx0ZG8ge1xuXHRcdGlmIChfcDEzLmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSB7XG5cdFx0XHRpZiAoX3AxMy5fMC5jdG9yID09PSAnQkJsYWNrJykge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGJyZWFrIF92MTRfMjtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKF9wMTMuXzAuY3RvciA9PT0gJ0xCQmxhY2snKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YnJlYWsgX3YxNF8yO1xuXHRcdFx0fVxuXHRcdH1cblx0fSB3aGlsZShmYWxzZSk7XG5cdHJldHVybiBmYWxzZTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRzaXplSGVscCA9IEYyKFxuXHRmdW5jdGlvbiAobiwgZGljdCkge1xuXHRcdHNpemVIZWxwOlxuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHR2YXIgX3AxNCA9IGRpY3Q7XG5cdFx0XHRpZiAoX3AxNC5jdG9yID09PSAnUkJFbXB0eV9lbG1fYnVpbHRpbicpIHtcblx0XHRcdFx0cmV0dXJuIG47XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgX3YxNiA9IEEyKF9lbG1fbGFuZyRjb3JlJERpY3Qkc2l6ZUhlbHAsIG4gKyAxLCBfcDE0Ll80KSxcblx0XHRcdFx0XHRfdjE3ID0gX3AxNC5fMztcblx0XHRcdFx0biA9IF92MTY7XG5cdFx0XHRcdGRpY3QgPSBfdjE3O1xuXHRcdFx0XHRjb250aW51ZSBzaXplSGVscDtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3Qkc2l6ZSA9IGZ1bmN0aW9uIChkaWN0KSB7XG5cdHJldHVybiBBMihfZWxtX2xhbmckY29yZSREaWN0JHNpemVIZWxwLCAwLCBkaWN0KTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRnZXQgPSBGMihcblx0ZnVuY3Rpb24gKHRhcmdldEtleSwgZGljdCkge1xuXHRcdGdldDpcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0dmFyIF9wMTUgPSBkaWN0O1xuXHRcdFx0aWYgKF9wMTUuY3RvciA9PT0gJ1JCRW1wdHlfZWxtX2J1aWx0aW4nKSB7XG5cdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIF9wMTYgPSBBMihfZWxtX2xhbmckY29yZSRCYXNpY3MkY29tcGFyZSwgdGFyZ2V0S2V5LCBfcDE1Ll8xKTtcblx0XHRcdFx0c3dpdGNoIChfcDE2LmN0b3IpIHtcblx0XHRcdFx0XHRjYXNlICdMVCc6XG5cdFx0XHRcdFx0XHR2YXIgX3YyMCA9IHRhcmdldEtleSxcblx0XHRcdFx0XHRcdFx0X3YyMSA9IF9wMTUuXzM7XG5cdFx0XHRcdFx0XHR0YXJnZXRLZXkgPSBfdjIwO1xuXHRcdFx0XHRcdFx0ZGljdCA9IF92MjE7XG5cdFx0XHRcdFx0XHRjb250aW51ZSBnZXQ7XG5cdFx0XHRcdFx0Y2FzZSAnRVEnOlxuXHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QoX3AxNS5fMik7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdHZhciBfdjIyID0gdGFyZ2V0S2V5LFxuXHRcdFx0XHRcdFx0XHRfdjIzID0gX3AxNS5fNDtcblx0XHRcdFx0XHRcdHRhcmdldEtleSA9IF92MjI7XG5cdFx0XHRcdFx0XHRkaWN0ID0gX3YyMztcblx0XHRcdFx0XHRcdGNvbnRpbnVlIGdldDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRtZW1iZXIgPSBGMihcblx0ZnVuY3Rpb24gKGtleSwgZGljdCkge1xuXHRcdHZhciBfcDE3ID0gQTIoX2VsbV9sYW5nJGNvcmUkRGljdCRnZXQsIGtleSwgZGljdCk7XG5cdFx0aWYgKF9wMTcuY3RvciA9PT0gJ0p1c3QnKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRtYXhXaXRoRGVmYXVsdCA9IEYzKFxuXHRmdW5jdGlvbiAoaywgdiwgcikge1xuXHRcdG1heFdpdGhEZWZhdWx0OlxuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHR2YXIgX3AxOCA9IHI7XG5cdFx0XHRpZiAoX3AxOC5jdG9yID09PSAnUkJFbXB0eV9lbG1fYnVpbHRpbicpIHtcblx0XHRcdFx0cmV0dXJuIHtjdG9yOiAnX1R1cGxlMicsIF8wOiBrLCBfMTogdn07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgX3YyNiA9IF9wMTguXzEsXG5cdFx0XHRcdFx0X3YyNyA9IF9wMTguXzIsXG5cdFx0XHRcdFx0X3YyOCA9IF9wMTguXzQ7XG5cdFx0XHRcdGsgPSBfdjI2O1xuXHRcdFx0XHR2ID0gX3YyNztcblx0XHRcdFx0ciA9IF92Mjg7XG5cdFx0XHRcdGNvbnRpbnVlIG1heFdpdGhEZWZhdWx0O1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCROQmxhY2sgPSB7Y3RvcjogJ05CbGFjayd9O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkQkJsYWNrID0ge2N0b3I6ICdCQmxhY2snfTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JEJsYWNrID0ge2N0b3I6ICdCbGFjayd9O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkYmxhY2tpc2ggPSBmdW5jdGlvbiAodCkge1xuXHR2YXIgX3AxOSA9IHQ7XG5cdGlmIChfcDE5LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSB7XG5cdFx0dmFyIF9wMjAgPSBfcDE5Ll8wO1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuZXEoX3AyMCwgX2VsbV9sYW5nJGNvcmUkRGljdCRCbGFjaykgfHwgX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmVxKF9wMjAsIF9lbG1fbGFuZyRjb3JlJERpY3QkQkJsYWNrKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JFJlZCA9IHtjdG9yOiAnUmVkJ307XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRtb3JlQmxhY2sgPSBmdW5jdGlvbiAoY29sb3IpIHtcblx0dmFyIF9wMjEgPSBjb2xvcjtcblx0c3dpdGNoIChfcDIxLmN0b3IpIHtcblx0XHRjYXNlICdCbGFjayc6XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkRGljdCRCQmxhY2s7XG5cdFx0Y2FzZSAnUmVkJzpcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSREaWN0JEJsYWNrO1xuXHRcdGNhc2UgJ05CbGFjayc6XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkRGljdCRSZWQ7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfRGVidWcuY3Jhc2goJ0NhblxcJ3QgbWFrZSBhIGRvdWJsZSBibGFjayBub2RlIG1vcmUgYmxhY2shJyk7XG5cdH1cbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRsZXNzQmxhY2sgPSBmdW5jdGlvbiAoY29sb3IpIHtcblx0dmFyIF9wMjIgPSBjb2xvcjtcblx0c3dpdGNoIChfcDIyLmN0b3IpIHtcblx0XHRjYXNlICdCQmxhY2snOlxuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkQmxhY2s7XG5cdFx0Y2FzZSAnQmxhY2snOlxuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkUmVkO1xuXHRcdGNhc2UgJ1JlZCc6XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkRGljdCROQmxhY2s7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfRGVidWcuY3Jhc2goJ0NhblxcJ3QgbWFrZSBhIG5lZ2F0aXZlIGJsYWNrIG5vZGUgbGVzcyBibGFjayEnKTtcblx0fVxufTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JExCQmxhY2sgPSB7Y3RvcjogJ0xCQmxhY2snfTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JExCbGFjayA9IHtjdG9yOiAnTEJsYWNrJ307XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRSQkVtcHR5X2VsbV9idWlsdGluID0gZnVuY3Rpb24gKGEpIHtcblx0cmV0dXJuIHtjdG9yOiAnUkJFbXB0eV9lbG1fYnVpbHRpbicsIF8wOiBhfTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRlbXB0eSA9IF9lbG1fbGFuZyRjb3JlJERpY3QkUkJFbXB0eV9lbG1fYnVpbHRpbihfZWxtX2xhbmckY29yZSREaWN0JExCbGFjayk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRpc0VtcHR5ID0gZnVuY3Rpb24gKGRpY3QpIHtcblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5lcShkaWN0LCBfZWxtX2xhbmckY29yZSREaWN0JGVtcHR5KTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4gPSBGNShcblx0ZnVuY3Rpb24gKGEsIGIsIGMsIGQsIGUpIHtcblx0XHRyZXR1cm4ge2N0b3I6ICdSQk5vZGVfZWxtX2J1aWx0aW4nLCBfMDogYSwgXzE6IGIsIF8yOiBjLCBfMzogZCwgXzQ6IGV9O1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGVuc3VyZUJsYWNrUm9vdCA9IGZ1bmN0aW9uIChkaWN0KSB7XG5cdHZhciBfcDIzID0gZGljdDtcblx0aWYgKChfcDIzLmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyMy5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRyZXR1cm4gQTUoX2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sIF9lbG1fbGFuZyRjb3JlJERpY3QkQmxhY2ssIF9wMjMuXzEsIF9wMjMuXzIsIF9wMjMuXzMsIF9wMjMuXzQpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBkaWN0O1xuXHR9XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkbGVzc0JsYWNrVHJlZSA9IGZ1bmN0aW9uIChkaWN0KSB7XG5cdHZhciBfcDI0ID0gZGljdDtcblx0aWYgKF9wMjQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpIHtcblx0XHRyZXR1cm4gQTUoXG5cdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JFJCTm9kZV9lbG1fYnVpbHRpbixcblx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkbGVzc0JsYWNrKF9wMjQuXzApLFxuXHRcdFx0X3AyNC5fMSxcblx0XHRcdF9wMjQuXzIsXG5cdFx0XHRfcDI0Ll8zLFxuXHRcdFx0X3AyNC5fNCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkUkJFbXB0eV9lbG1fYnVpbHRpbihfZWxtX2xhbmckY29yZSREaWN0JExCbGFjayk7XG5cdH1cbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRiYWxhbmNlZFRyZWUgPSBmdW5jdGlvbiAoY29sKSB7XG5cdHJldHVybiBmdW5jdGlvbiAoeGspIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKHh2KSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24gKHlrKSB7XG5cdFx0XHRcdHJldHVybiBmdW5jdGlvbiAoeXYpIHtcblx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24gKHprKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24gKHp2KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbiAoYSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbiAoYikge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uIChjKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbiAoZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBBNShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRsZXNzQmxhY2soY29sKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHlrLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0eXYsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRBNShfZWxtX2xhbmckY29yZSREaWN0JFJCTm9kZV9lbG1fYnVpbHRpbiwgX2VsbV9sYW5nJGNvcmUkRGljdCRCbGFjaywgeGssIHh2LCBhLCBiKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLCBfZWxtX2xhbmckY29yZSREaWN0JEJsYWNrLCB6aywgenYsIGMsIGQpKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fTtcblx0XHRcdH07XG5cdFx0fTtcblx0fTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRibGFja2VuID0gZnVuY3Rpb24gKHQpIHtcblx0dmFyIF9wMjUgPSB0O1xuXHRpZiAoX3AyNS5jdG9yID09PSAnUkJFbXB0eV9lbG1fYnVpbHRpbicpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkRGljdCRSQkVtcHR5X2VsbV9idWlsdGluKF9lbG1fbGFuZyRjb3JlJERpY3QkTEJsYWNrKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gQTUoX2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sIF9lbG1fbGFuZyRjb3JlJERpY3QkQmxhY2ssIF9wMjUuXzEsIF9wMjUuXzIsIF9wMjUuXzMsIF9wMjUuXzQpO1xuXHR9XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkcmVkZGVuID0gZnVuY3Rpb24gKHQpIHtcblx0dmFyIF9wMjYgPSB0O1xuXHRpZiAoX3AyNi5jdG9yID09PSAnUkJFbXB0eV9lbG1fYnVpbHRpbicpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0RlYnVnLmNyYXNoKCdjYW5cXCd0IG1ha2UgYSBMZWFmIHJlZCcpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBBNShfZWxtX2xhbmckY29yZSREaWN0JFJCTm9kZV9lbG1fYnVpbHRpbiwgX2VsbV9sYW5nJGNvcmUkRGljdCRSZWQsIF9wMjYuXzEsIF9wMjYuXzIsIF9wMjYuXzMsIF9wMjYuXzQpO1xuXHR9XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkYmFsYW5jZUhlbHAgPSBmdW5jdGlvbiAodHJlZSkge1xuXHR2YXIgX3AyNyA9IHRyZWU7XG5cdF92MzZfNjpcblx0ZG8ge1xuXHRcdF92MzZfNTpcblx0XHRkbyB7XG5cdFx0XHRfdjM2XzQ6XG5cdFx0XHRkbyB7XG5cdFx0XHRcdF92MzZfMzpcblx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdF92MzZfMjpcblx0XHRcdFx0XHRkbyB7XG5cdFx0XHRcdFx0XHRfdjM2XzE6XG5cdFx0XHRcdFx0XHRkbyB7XG5cdFx0XHRcdFx0XHRcdF92MzZfMDpcblx0XHRcdFx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChfcDI3LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoX3AyNy5fMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoX3AyNy5fNC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoX3AyNy5fMy5fMC5jdG9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlICdSZWQnOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKF9wMjcuXzQuXzAuY3Rvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgJ1JlZCc6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKF9wMjcuXzMuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpICYmIChfcDI3Ll8zLl8zLl8wLmN0b3IgPT09ICdSZWQnKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKF9wMjcuXzMuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpICYmIChfcDI3Ll8zLl80Ll8wLmN0b3IgPT09ICdSZWQnKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfMTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKF9wMjcuXzQuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpICYmIChfcDI3Ll80Ll8zLl8wLmN0b3IgPT09ICdSZWQnKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl8yO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKF9wMjcuXzQuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpICYmIChfcDI3Ll80Ll80Ll8wLmN0b3IgPT09ICdSZWQnKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzM7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSAnTkJsYWNrJzpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoX3AyNy5fMy5fMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykgJiYgKF9wMjcuXzMuXzMuXzAuY3RvciA9PT0gJ1JlZCcpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfMDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoX3AyNy5fMy5fNC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykgJiYgKF9wMjcuXzMuXzQuXzAuY3RvciA9PT0gJ1JlZCcpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl8xO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoKCgoX3AyNy5fMC5jdG9yID09PSAnQkJsYWNrJykgJiYgKF9wMjcuXzQuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpKSAmJiAoX3AyNy5fNC5fMy5fMC5jdG9yID09PSAnQmxhY2snKSkgJiYgKF9wMjcuXzQuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpKSAmJiAoX3AyNy5fNC5fNC5fMC5jdG9yID09PSAnQmxhY2snKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl80O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoX3AyNy5fMy5fMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykgJiYgKF9wMjcuXzMuXzMuXzAuY3RvciA9PT0gJ1JlZCcpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfMDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoX3AyNy5fMy5fNC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykgJiYgKF9wMjcuXzMuXzQuXzAuY3RvciA9PT0gJ1JlZCcpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl8xO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlICdOQmxhY2snOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKF9wMjcuXzQuXzAuY3Rvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgJ1JlZCc6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKF9wMjcuXzQuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpICYmIChfcDI3Ll80Ll8zLl8wLmN0b3IgPT09ICdSZWQnKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKF9wMjcuXzQuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpICYmIChfcDI3Ll80Ll80Ll8wLmN0b3IgPT09ICdSZWQnKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfMztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKCgoKF9wMjcuXzAuY3RvciA9PT0gJ0JCbGFjaycpICYmIChfcDI3Ll8zLl8zLmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSkgJiYgKF9wMjcuXzMuXzMuXzAuY3RvciA9PT0gJ0JsYWNrJykpICYmIChfcDI3Ll8zLl80LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSkgJiYgKF9wMjcuXzMuXzQuXzAuY3RvciA9PT0gJ0JsYWNrJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl82O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgJ05CbGFjayc6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoX3AyNy5fMC5jdG9yID09PSAnQkJsYWNrJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKCgoX3AyNy5fNC5fMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykgJiYgKF9wMjcuXzQuXzMuXzAuY3RvciA9PT0gJ0JsYWNrJykpICYmIChfcDI3Ll80Ll80LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSkgJiYgKF9wMjcuXzQuXzQuXzAuY3RvciA9PT0gJ0JsYWNrJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzQ7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCgoKF9wMjcuXzMuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpICYmIChfcDI3Ll8zLl8zLl8wLmN0b3IgPT09ICdCbGFjaycpKSAmJiAoX3AyNy5fMy5fNC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykpICYmIChfcDI3Ll8zLl80Ll8wLmN0b3IgPT09ICdCbGFjaycpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCgoKChfcDI3Ll8wLmN0b3IgPT09ICdCQmxhY2snKSAmJiAoX3AyNy5fMy5fMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykpICYmIChfcDI3Ll8zLl8zLl8wLmN0b3IgPT09ICdCbGFjaycpKSAmJiAoX3AyNy5fMy5fNC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykpICYmIChfcDI3Ll8zLl80Ll8wLmN0b3IgPT09ICdCbGFjaycpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChfcDI3Ll80Ll8wLmN0b3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlICdSZWQnOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDI3Ll80Ll8zLmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fNC5fMy5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl8yO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDI3Ll80Ll80LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fNC5fNC5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzM7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl82O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSAnTkJsYWNrJzpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoKCgoX3AyNy5fMC5jdG9yID09PSAnQkJsYWNrJykgJiYgKF9wMjcuXzQuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpKSAmJiAoX3AyNy5fNC5fMy5fMC5jdG9yID09PSAnQmxhY2snKSkgJiYgKF9wMjcuXzQuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpKSAmJiAoX3AyNy5fNC5fNC5fMC5jdG9yID09PSAnQmxhY2snKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzQ7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKF9wMjcuXzMuXzAuY3Rvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSAnUmVkJzpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDI3Ll8zLl8zLmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fMy5fMy5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDI3Ll8zLl80LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fMy5fNC5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfMTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl82O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSAnTkJsYWNrJzpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCgoKChfcDI3Ll8wLmN0b3IgPT09ICdCQmxhY2snKSAmJiAoX3AyNy5fMy5fMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykpICYmIChfcDI3Ll8zLl8zLl8wLmN0b3IgPT09ICdCbGFjaycpKSAmJiAoX3AyNy5fMy5fNC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykpICYmIChfcDI3Ll8zLl80Ll8wLmN0b3IgPT09ICdCbGFjaycpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl81O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl82O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKF9wMjcuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKF9wMjcuXzQuXzAuY3Rvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSAnUmVkJzpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDI3Ll80Ll8zLmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fNC5fMy5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzI7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDI3Ll80Ll80LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fNC5fNC5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfMztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl82O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSAnTkJsYWNrJzpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCgoKChfcDI3Ll8wLmN0b3IgPT09ICdCQmxhY2snKSAmJiAoX3AyNy5fNC5fMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykpICYmIChfcDI3Ll80Ll8zLl8wLmN0b3IgPT09ICdCbGFjaycpKSAmJiAoX3AyNy5fNC5fNC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykpICYmIChfcDI3Ll80Ll80Ll8wLmN0b3IgPT09ICdCbGFjaycpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl80O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl82O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl82O1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSB3aGlsZShmYWxzZSk7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSREaWN0JGJhbGFuY2VkVHJlZShfcDI3Ll8wKShfcDI3Ll8zLl8zLl8xKShfcDI3Ll8zLl8zLl8yKShfcDI3Ll8zLl8xKShfcDI3Ll8zLl8yKShfcDI3Ll8xKShfcDI3Ll8yKShfcDI3Ll8zLl8zLl8zKShfcDI3Ll8zLl8zLl80KShfcDI3Ll8zLl80KShfcDI3Ll80KTtcblx0XHRcdFx0XHRcdH0gd2hpbGUoZmFsc2UpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkYmFsYW5jZWRUcmVlKF9wMjcuXzApKF9wMjcuXzMuXzEpKF9wMjcuXzMuXzIpKF9wMjcuXzMuXzQuXzEpKF9wMjcuXzMuXzQuXzIpKF9wMjcuXzEpKF9wMjcuXzIpKF9wMjcuXzMuXzMpKF9wMjcuXzMuXzQuXzMpKF9wMjcuXzMuXzQuXzQpKF9wMjcuXzQpO1xuXHRcdFx0XHRcdH0gd2hpbGUoZmFsc2UpO1xuXHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSREaWN0JGJhbGFuY2VkVHJlZShfcDI3Ll8wKShfcDI3Ll8xKShfcDI3Ll8yKShfcDI3Ll80Ll8zLl8xKShfcDI3Ll80Ll8zLl8yKShfcDI3Ll80Ll8xKShfcDI3Ll80Ll8yKShfcDI3Ll8zKShfcDI3Ll80Ll8zLl8zKShfcDI3Ll80Ll8zLl80KShfcDI3Ll80Ll80KTtcblx0XHRcdFx0fSB3aGlsZShmYWxzZSk7XG5cdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSREaWN0JGJhbGFuY2VkVHJlZShfcDI3Ll8wKShfcDI3Ll8xKShfcDI3Ll8yKShfcDI3Ll80Ll8xKShfcDI3Ll80Ll8yKShfcDI3Ll80Ll80Ll8xKShfcDI3Ll80Ll80Ll8yKShfcDI3Ll8zKShfcDI3Ll80Ll8zKShfcDI3Ll80Ll80Ll8zKShfcDI3Ll80Ll80Ll80KTtcblx0XHRcdH0gd2hpbGUoZmFsc2UpO1xuXHRcdFx0cmV0dXJuIEE1KFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JFJCTm9kZV9lbG1fYnVpbHRpbixcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRCbGFjayxcblx0XHRcdFx0X3AyNy5fNC5fMy5fMSxcblx0XHRcdFx0X3AyNy5fNC5fMy5fMixcblx0XHRcdFx0QTUoX2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sIF9lbG1fbGFuZyRjb3JlJERpY3QkQmxhY2ssIF9wMjcuXzEsIF9wMjcuXzIsIF9wMjcuXzMsIF9wMjcuXzQuXzMuXzMpLFxuXHRcdFx0XHRBNShcblx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JGJhbGFuY2UsXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRCbGFjayxcblx0XHRcdFx0XHRfcDI3Ll80Ll8xLFxuXHRcdFx0XHRcdF9wMjcuXzQuXzIsXG5cdFx0XHRcdFx0X3AyNy5fNC5fMy5fNCxcblx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JHJlZGRlbihfcDI3Ll80Ll80KSkpO1xuXHRcdH0gd2hpbGUoZmFsc2UpO1xuXHRcdHJldHVybiBBNShcblx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRCbGFjayxcblx0XHRcdF9wMjcuXzMuXzQuXzEsXG5cdFx0XHRfcDI3Ll8zLl80Ll8yLFxuXHRcdFx0QTUoXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkYmFsYW5jZSxcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRCbGFjayxcblx0XHRcdFx0X3AyNy5fMy5fMSxcblx0XHRcdFx0X3AyNy5fMy5fMixcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRyZWRkZW4oX3AyNy5fMy5fMyksXG5cdFx0XHRcdF9wMjcuXzMuXzQuXzMpLFxuXHRcdFx0QTUoX2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sIF9lbG1fbGFuZyRjb3JlJERpY3QkQmxhY2ssIF9wMjcuXzEsIF9wMjcuXzIsIF9wMjcuXzMuXzQuXzQsIF9wMjcuXzQpKTtcblx0fSB3aGlsZShmYWxzZSk7XG5cdHJldHVybiB0cmVlO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGJhbGFuY2UgPSBGNShcblx0ZnVuY3Rpb24gKGMsIGssIHYsIGwsIHIpIHtcblx0XHR2YXIgdHJlZSA9IEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLCBjLCBrLCB2LCBsLCByKTtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkRGljdCRibGFja2lzaCh0cmVlKSA/IF9lbG1fbGFuZyRjb3JlJERpY3QkYmFsYW5jZUhlbHAodHJlZSkgOiB0cmVlO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGJ1YmJsZSA9IEY1KFxuXHRmdW5jdGlvbiAoYywgaywgdiwgbCwgcikge1xuXHRcdHJldHVybiAoX2VsbV9sYW5nJGNvcmUkRGljdCRpc0JCbGFjayhsKSB8fCBfZWxtX2xhbmckY29yZSREaWN0JGlzQkJsYWNrKHIpKSA/IEE1KFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRiYWxhbmNlLFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRtb3JlQmxhY2soYyksXG5cdFx0XHRrLFxuXHRcdFx0dixcblx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkbGVzc0JsYWNrVHJlZShsKSxcblx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkbGVzc0JsYWNrVHJlZShyKSkgOiBBNShfZWxtX2xhbmckY29yZSREaWN0JFJCTm9kZV9lbG1fYnVpbHRpbiwgYywgaywgdiwgbCwgcik7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkcmVtb3ZlTWF4ID0gRjUoXG5cdGZ1bmN0aW9uIChjLCBrLCB2LCBsLCByKSB7XG5cdFx0dmFyIF9wMjggPSByO1xuXHRcdGlmIChfcDI4LmN0b3IgPT09ICdSQkVtcHR5X2VsbV9idWlsdGluJykge1xuXHRcdFx0cmV0dXJuIEEzKF9lbG1fbGFuZyRjb3JlJERpY3QkcmVtLCBjLCBsLCByKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIEE1KFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JGJ1YmJsZSxcblx0XHRcdFx0Yyxcblx0XHRcdFx0ayxcblx0XHRcdFx0dixcblx0XHRcdFx0bCxcblx0XHRcdFx0QTUoX2VsbV9sYW5nJGNvcmUkRGljdCRyZW1vdmVNYXgsIF9wMjguXzAsIF9wMjguXzEsIF9wMjguXzIsIF9wMjguXzMsIF9wMjguXzQpKTtcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkcmVtID0gRjMoXG5cdGZ1bmN0aW9uIChjLCBsLCByKSB7XG5cdFx0dmFyIF9wMjkgPSB7Y3RvcjogJ19UdXBsZTInLCBfMDogbCwgXzE6IHJ9O1xuXHRcdGlmIChfcDI5Ll8wLmN0b3IgPT09ICdSQkVtcHR5X2VsbV9idWlsdGluJykge1xuXHRcdFx0aWYgKF9wMjkuXzEuY3RvciA9PT0gJ1JCRW1wdHlfZWxtX2J1aWx0aW4nKSB7XG5cdFx0XHRcdHZhciBfcDMwID0gYztcblx0XHRcdFx0c3dpdGNoIChfcDMwLmN0b3IpIHtcblx0XHRcdFx0XHRjYXNlICdSZWQnOlxuXHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkUkJFbXB0eV9lbG1fYnVpbHRpbihfZWxtX2xhbmckY29yZSREaWN0JExCbGFjayk7XG5cdFx0XHRcdFx0Y2FzZSAnQmxhY2snOlxuXHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkUkJFbXB0eV9lbG1fYnVpbHRpbihfZWxtX2xhbmckY29yZSREaWN0JExCQmxhY2spO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0RlYnVnLmNyYXNoKCdjYW5ub3QgaGF2ZSBiYmxhY2sgb3IgbmJsYWNrIG5vZGVzIGF0IHRoaXMgcG9pbnQnKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIF9wMzMgPSBfcDI5Ll8xLl8wO1xuXHRcdFx0XHR2YXIgX3AzMiA9IF9wMjkuXzAuXzA7XG5cdFx0XHRcdHZhciBfcDMxID0ge2N0b3I6ICdfVHVwbGUzJywgXzA6IGMsIF8xOiBfcDMyLCBfMjogX3AzM307XG5cdFx0XHRcdGlmICgoKChfcDMxLmN0b3IgPT09ICdfVHVwbGUzJykgJiYgKF9wMzEuXzAuY3RvciA9PT0gJ0JsYWNrJykpICYmIChfcDMxLl8xLmN0b3IgPT09ICdMQmxhY2snKSkgJiYgKF9wMzEuXzIuY3RvciA9PT0gJ1JlZCcpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLCBfZWxtX2xhbmckY29yZSREaWN0JEJsYWNrLCBfcDI5Ll8xLl8xLCBfcDI5Ll8xLl8yLCBfcDI5Ll8xLl8zLCBfcDI5Ll8xLl80KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gQTQoXG5cdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JHJlcG9ydFJlbUJ1Zyxcblx0XHRcdFx0XHRcdCdCbGFjay9MQmxhY2svUmVkJyxcblx0XHRcdFx0XHRcdGMsXG5cdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRCYXNpY3MkdG9TdHJpbmcoX3AzMiksXG5cdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRCYXNpY3MkdG9TdHJpbmcoX3AzMykpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChfcDI5Ll8xLmN0b3IgPT09ICdSQkVtcHR5X2VsbV9idWlsdGluJykge1xuXHRcdFx0XHR2YXIgX3AzNiA9IF9wMjkuXzEuXzA7XG5cdFx0XHRcdHZhciBfcDM1ID0gX3AyOS5fMC5fMDtcblx0XHRcdFx0dmFyIF9wMzQgPSB7Y3RvcjogJ19UdXBsZTMnLCBfMDogYywgXzE6IF9wMzUsIF8yOiBfcDM2fTtcblx0XHRcdFx0aWYgKCgoKF9wMzQuY3RvciA9PT0gJ19UdXBsZTMnKSAmJiAoX3AzNC5fMC5jdG9yID09PSAnQmxhY2snKSkgJiYgKF9wMzQuXzEuY3RvciA9PT0gJ1JlZCcpKSAmJiAoX3AzNC5fMi5jdG9yID09PSAnTEJsYWNrJykpIHtcblx0XHRcdFx0XHRyZXR1cm4gQTUoX2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sIF9lbG1fbGFuZyRjb3JlJERpY3QkQmxhY2ssIF9wMjkuXzAuXzEsIF9wMjkuXzAuXzIsIF9wMjkuXzAuXzMsIF9wMjkuXzAuXzQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBBNChcblx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkcmVwb3J0UmVtQnVnLFxuXHRcdFx0XHRcdFx0J0JsYWNrL1JlZC9MQmxhY2snLFxuXHRcdFx0XHRcdFx0Yyxcblx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEJhc2ljcyR0b1N0cmluZyhfcDM1KSxcblx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEJhc2ljcyR0b1N0cmluZyhfcDM2KSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBfcDQwID0gX3AyOS5fMC5fMjtcblx0XHRcdFx0dmFyIF9wMzkgPSBfcDI5Ll8wLl80O1xuXHRcdFx0XHR2YXIgX3AzOCA9IF9wMjkuXzAuXzE7XG5cdFx0XHRcdHZhciBsJCA9IEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkcmVtb3ZlTWF4LCBfcDI5Ll8wLl8wLCBfcDM4LCBfcDQwLCBfcDI5Ll8wLl8zLCBfcDM5KTtcblx0XHRcdFx0dmFyIF9wMzcgPSBBMyhfZWxtX2xhbmckY29yZSREaWN0JG1heFdpdGhEZWZhdWx0LCBfcDM4LCBfcDQwLCBfcDM5KTtcblx0XHRcdFx0dmFyIGsgPSBfcDM3Ll8wO1xuXHRcdFx0XHR2YXIgdiA9IF9wMzcuXzE7XG5cdFx0XHRcdHJldHVybiBBNShfZWxtX2xhbmckY29yZSREaWN0JGJ1YmJsZSwgYywgaywgdiwgbCQsIHIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRtYXAgPSBGMihcblx0ZnVuY3Rpb24gKGYsIGRpY3QpIHtcblx0XHR2YXIgX3A0MSA9IGRpY3Q7XG5cdFx0aWYgKF9wNDEuY3RvciA9PT0gJ1JCRW1wdHlfZWxtX2J1aWx0aW4nKSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkRGljdCRSQkVtcHR5X2VsbV9idWlsdGluKF9lbG1fbGFuZyRjb3JlJERpY3QkTEJsYWNrKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIF9wNDIgPSBfcDQxLl8xO1xuXHRcdFx0cmV0dXJuIEE1KFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JFJCTm9kZV9lbG1fYnVpbHRpbixcblx0XHRcdFx0X3A0MS5fMCxcblx0XHRcdFx0X3A0Mixcblx0XHRcdFx0QTIoZiwgX3A0MiwgX3A0MS5fMiksXG5cdFx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJERpY3QkbWFwLCBmLCBfcDQxLl8zKSxcblx0XHRcdFx0QTIoX2VsbV9sYW5nJGNvcmUkRGljdCRtYXAsIGYsIF9wNDEuXzQpKTtcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkU2FtZSA9IHtjdG9yOiAnU2FtZSd9O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkUmVtb3ZlID0ge2N0b3I6ICdSZW1vdmUnfTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JEluc2VydCA9IHtjdG9yOiAnSW5zZXJ0J307XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCR1cGRhdGUgPSBGMyhcblx0ZnVuY3Rpb24gKGssIGFsdGVyLCBkaWN0KSB7XG5cdFx0dmFyIHVwID0gZnVuY3Rpb24gKGRpY3QpIHtcblx0XHRcdHZhciBfcDQzID0gZGljdDtcblx0XHRcdGlmIChfcDQzLmN0b3IgPT09ICdSQkVtcHR5X2VsbV9idWlsdGluJykge1xuXHRcdFx0XHR2YXIgX3A0NCA9IGFsdGVyKF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmcpO1xuXHRcdFx0XHRpZiAoX3A0NC5jdG9yID09PSAnTm90aGluZycpIHtcblx0XHRcdFx0XHRyZXR1cm4ge2N0b3I6ICdfVHVwbGUyJywgXzA6IF9lbG1fbGFuZyRjb3JlJERpY3QkU2FtZSwgXzE6IF9lbG1fbGFuZyRjb3JlJERpY3QkZW1wdHl9O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XHRfMDogX2VsbV9sYW5nJGNvcmUkRGljdCRJbnNlcnQsXG5cdFx0XHRcdFx0XHRfMTogQTUoX2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sIF9lbG1fbGFuZyRjb3JlJERpY3QkUmVkLCBrLCBfcDQ0Ll8wLCBfZWxtX2xhbmckY29yZSREaWN0JGVtcHR5LCBfZWxtX2xhbmckY29yZSREaWN0JGVtcHR5KVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBfcDU1ID0gX3A0My5fMjtcblx0XHRcdFx0dmFyIF9wNTQgPSBfcDQzLl80O1xuXHRcdFx0XHR2YXIgX3A1MyA9IF9wNDMuXzM7XG5cdFx0XHRcdHZhciBfcDUyID0gX3A0My5fMTtcblx0XHRcdFx0dmFyIF9wNTEgPSBfcDQzLl8wO1xuXHRcdFx0XHR2YXIgX3A0NSA9IEEyKF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRjb21wYXJlLCBrLCBfcDUyKTtcblx0XHRcdFx0c3dpdGNoIChfcDQ1LmN0b3IpIHtcblx0XHRcdFx0XHRjYXNlICdFUSc6XG5cdFx0XHRcdFx0XHR2YXIgX3A0NiA9IGFsdGVyKFxuXHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0KF9wNTUpKTtcblx0XHRcdFx0XHRcdGlmIChfcDQ2LmN0b3IgPT09ICdOb3RoaW5nJykge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRcdFx0XHRfMDogX2VsbV9sYW5nJGNvcmUkRGljdCRSZW1vdmUsXG5cdFx0XHRcdFx0XHRcdFx0XzE6IEEzKF9lbG1fbGFuZyRjb3JlJERpY3QkcmVtLCBfcDUxLCBfcDUzLCBfcDU0KVxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XHRcdFx0XzA6IF9lbG1fbGFuZyRjb3JlJERpY3QkU2FtZSxcblx0XHRcdFx0XHRcdFx0XHRfMTogQTUoX2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sIF9wNTEsIF9wNTIsIF9wNDYuXzAsIF9wNTMsIF9wNTQpXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FzZSAnTFQnOlxuXHRcdFx0XHRcdFx0dmFyIF9wNDcgPSB1cChfcDUzKTtcblx0XHRcdFx0XHRcdHZhciBmbGFnID0gX3A0Ny5fMDtcblx0XHRcdFx0XHRcdHZhciBuZXdMZWZ0ID0gX3A0Ny5fMTtcblx0XHRcdFx0XHRcdHZhciBfcDQ4ID0gZmxhZztcblx0XHRcdFx0XHRcdHN3aXRjaCAoX3A0OC5jdG9yKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgJ1NhbWUnOlxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XHRcdFx0XHRfMDogX2VsbV9sYW5nJGNvcmUkRGljdCRTYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XzE6IEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLCBfcDUxLCBfcDUyLCBfcDU1LCBuZXdMZWZ0LCBfcDU0KVxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGNhc2UgJ0luc2VydCc6XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRcdFx0XHRcdF8wOiBfZWxtX2xhbmckY29yZSREaWN0JEluc2VydCxcblx0XHRcdFx0XHRcdFx0XHRcdF8xOiBBNShfZWxtX2xhbmckY29yZSREaWN0JGJhbGFuY2UsIF9wNTEsIF9wNTIsIF9wNTUsIG5ld0xlZnQsIF9wNTQpXG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdFx0XHRcdFx0XzA6IF9lbG1fbGFuZyRjb3JlJERpY3QkUmVtb3ZlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XzE6IEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkYnViYmxlLCBfcDUxLCBfcDUyLCBfcDU1LCBuZXdMZWZ0LCBfcDU0KVxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdHZhciBfcDQ5ID0gdXAoX3A1NCk7XG5cdFx0XHRcdFx0XHR2YXIgZmxhZyA9IF9wNDkuXzA7XG5cdFx0XHRcdFx0XHR2YXIgbmV3UmlnaHQgPSBfcDQ5Ll8xO1xuXHRcdFx0XHRcdFx0dmFyIF9wNTAgPSBmbGFnO1xuXHRcdFx0XHRcdFx0c3dpdGNoIChfcDUwLmN0b3IpIHtcblx0XHRcdFx0XHRcdFx0Y2FzZSAnU2FtZSc6XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRcdFx0XHRcdF8wOiBfZWxtX2xhbmckY29yZSREaWN0JFNhbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRfMTogQTUoX2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sIF9wNTEsIF9wNTIsIF9wNTUsIF9wNTMsIG5ld1JpZ2h0KVxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGNhc2UgJ0luc2VydCc6XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRcdFx0XHRcdF8wOiBfZWxtX2xhbmckY29yZSREaWN0JEluc2VydCxcblx0XHRcdFx0XHRcdFx0XHRcdF8xOiBBNShfZWxtX2xhbmckY29yZSREaWN0JGJhbGFuY2UsIF9wNTEsIF9wNTIsIF9wNTUsIF9wNTMsIG5ld1JpZ2h0KVxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRcdFx0XHRcdF8wOiBfZWxtX2xhbmckY29yZSREaWN0JFJlbW92ZSxcblx0XHRcdFx0XHRcdFx0XHRcdF8xOiBBNShfZWxtX2xhbmckY29yZSREaWN0JGJ1YmJsZSwgX3A1MSwgX3A1MiwgX3A1NSwgX3A1MywgbmV3UmlnaHQpXG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0dmFyIF9wNTYgPSB1cChkaWN0KTtcblx0XHR2YXIgZmxhZyA9IF9wNTYuXzA7XG5cdFx0dmFyIHVwZGF0ZWREaWN0ID0gX3A1Ni5fMTtcblx0XHR2YXIgX3A1NyA9IGZsYWc7XG5cdFx0c3dpdGNoIChfcDU3LmN0b3IpIHtcblx0XHRcdGNhc2UgJ1NhbWUnOlxuXHRcdFx0XHRyZXR1cm4gdXBkYXRlZERpY3Q7XG5cdFx0XHRjYXNlICdJbnNlcnQnOlxuXHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkRGljdCRlbnN1cmVCbGFja1Jvb3QodXBkYXRlZERpY3QpO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkYmxhY2tlbih1cGRhdGVkRGljdCk7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGluc2VydCA9IEYzKFxuXHRmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgZGljdCkge1xuXHRcdHJldHVybiBBMyhcblx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkdXBkYXRlLFxuXHRcdFx0a2V5LFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkQmFzaWNzJGFsd2F5cyhcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTWF5YmUkSnVzdCh2YWx1ZSkpLFxuXHRcdFx0ZGljdCk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3Qkc2luZ2xldG9uID0gRjIoXG5cdGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cdFx0cmV0dXJuIEEzKF9lbG1fbGFuZyRjb3JlJERpY3QkaW5zZXJ0LCBrZXksIHZhbHVlLCBfZWxtX2xhbmckY29yZSREaWN0JGVtcHR5KTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCR1bmlvbiA9IEYyKFxuXHRmdW5jdGlvbiAodDEsIHQyKSB7XG5cdFx0cmV0dXJuIEEzKF9lbG1fbGFuZyRjb3JlJERpY3QkZm9sZGwsIF9lbG1fbGFuZyRjb3JlJERpY3QkaW5zZXJ0LCB0MiwgdDEpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGZpbHRlciA9IEYyKFxuXHRmdW5jdGlvbiAocHJlZGljYXRlLCBkaWN0aW9uYXJ5KSB7XG5cdFx0dmFyIGFkZCA9IEYzKFxuXHRcdFx0ZnVuY3Rpb24gKGtleSwgdmFsdWUsIGRpY3QpIHtcblx0XHRcdFx0cmV0dXJuIEEyKHByZWRpY2F0ZSwga2V5LCB2YWx1ZSkgPyBBMyhfZWxtX2xhbmckY29yZSREaWN0JGluc2VydCwga2V5LCB2YWx1ZSwgZGljdCkgOiBkaWN0O1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuIEEzKF9lbG1fbGFuZyRjb3JlJERpY3QkZm9sZGwsIGFkZCwgX2VsbV9sYW5nJGNvcmUkRGljdCRlbXB0eSwgZGljdGlvbmFyeSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkaW50ZXJzZWN0ID0gRjIoXG5cdGZ1bmN0aW9uICh0MSwgdDIpIHtcblx0XHRyZXR1cm4gQTIoXG5cdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JGZpbHRlcixcblx0XHRcdEYyKFxuXHRcdFx0XHRmdW5jdGlvbiAoaywgX3A1OCkge1xuXHRcdFx0XHRcdHJldHVybiBBMihfZWxtX2xhbmckY29yZSREaWN0JG1lbWJlciwgaywgdDIpO1xuXHRcdFx0XHR9KSxcblx0XHRcdHQxKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRwYXJ0aXRpb24gPSBGMihcblx0ZnVuY3Rpb24gKHByZWRpY2F0ZSwgZGljdCkge1xuXHRcdHZhciBhZGQgPSBGMyhcblx0XHRcdGZ1bmN0aW9uIChrZXksIHZhbHVlLCBfcDU5KSB7XG5cdFx0XHRcdHZhciBfcDYwID0gX3A1OTtcblx0XHRcdFx0dmFyIF9wNjIgPSBfcDYwLl8xO1xuXHRcdFx0XHR2YXIgX3A2MSA9IF9wNjAuXzA7XG5cdFx0XHRcdHJldHVybiBBMihwcmVkaWNhdGUsIGtleSwgdmFsdWUpID8ge1xuXHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRfMDogQTMoX2VsbV9sYW5nJGNvcmUkRGljdCRpbnNlcnQsIGtleSwgdmFsdWUsIF9wNjEpLFxuXHRcdFx0XHRcdF8xOiBfcDYyXG5cdFx0XHRcdH0gOiB7XG5cdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdF8wOiBfcDYxLFxuXHRcdFx0XHRcdF8xOiBBMyhfZWxtX2xhbmckY29yZSREaWN0JGluc2VydCwga2V5LCB2YWx1ZSwgX3A2Milcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiBBMyhcblx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkZm9sZGwsXG5cdFx0XHRhZGQsXG5cdFx0XHR7Y3RvcjogJ19UdXBsZTInLCBfMDogX2VsbV9sYW5nJGNvcmUkRGljdCRlbXB0eSwgXzE6IF9lbG1fbGFuZyRjb3JlJERpY3QkZW1wdHl9LFxuXHRcdFx0ZGljdCk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkZnJvbUxpc3QgPSBmdW5jdGlvbiAoYXNzb2NzKSB7XG5cdHJldHVybiBBMyhcblx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGZvbGRsLFxuXHRcdEYyKFxuXHRcdFx0ZnVuY3Rpb24gKF9wNjMsIGRpY3QpIHtcblx0XHRcdFx0dmFyIF9wNjQgPSBfcDYzO1xuXHRcdFx0XHRyZXR1cm4gQTMoX2VsbV9sYW5nJGNvcmUkRGljdCRpbnNlcnQsIF9wNjQuXzAsIF9wNjQuXzEsIGRpY3QpO1xuXHRcdFx0fSksXG5cdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRlbXB0eSxcblx0XHRhc3NvY3MpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JHJlbW92ZSA9IEYyKFxuXHRmdW5jdGlvbiAoa2V5LCBkaWN0KSB7XG5cdFx0cmV0dXJuIEEzKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCR1cGRhdGUsXG5cdFx0XHRrZXksXG5cdFx0XHRfZWxtX2xhbmckY29yZSRCYXNpY3MkYWx3YXlzKF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmcpLFxuXHRcdFx0ZGljdCk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkZGlmZiA9IEYyKFxuXHRmdW5jdGlvbiAodDEsIHQyKSB7XG5cdFx0cmV0dXJuIEEzKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRmb2xkbCxcblx0XHRcdEYzKFxuXHRcdFx0XHRmdW5jdGlvbiAoaywgdiwgdCkge1xuXHRcdFx0XHRcdHJldHVybiBBMihfZWxtX2xhbmckY29yZSREaWN0JHJlbW92ZSwgaywgdCk7XG5cdFx0XHRcdH0pLFxuXHRcdFx0dDEsXG5cdFx0XHR0Mik7XG5cdH0pO1xuXG52YXIgX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fU3ViJGJhdGNoID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1BsYXRmb3JtLmJhdGNoO1xudmFyIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX1N1YiRub25lID0gX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fU3ViJGJhdGNoKFxuXHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0W10pKTtcbnZhciBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9TdWIkbWFwID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1BsYXRmb3JtLm1hcDtcbnZhciBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9TdWIkU3ViID0ge2N0b3I6ICdTdWInfTtcblxudmFyIF9lbG1fbGFuZyRjb3JlJERlYnVnJGNyYXNoID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0RlYnVnLmNyYXNoO1xudmFyIF9lbG1fbGFuZyRjb3JlJERlYnVnJGxvZyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9EZWJ1Zy5sb2c7XG5cbi8vaW1wb3J0IE1heWJlLCBOYXRpdmUuQXJyYXksIE5hdGl2ZS5MaXN0LCBOYXRpdmUuVXRpbHMsIFJlc3VsdCAvL1xuXG52YXIgX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24gPSBmdW5jdGlvbigpIHtcblxuXG4vLyBDT1JFIERFQ09ERVJTXG5cbmZ1bmN0aW9uIHN1Y2NlZWQobXNnKVxue1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICc8ZGVjb2Rlcj4nLFxuXHRcdHRhZzogJ3N1Y2NlZWQnLFxuXHRcdG1zZzogbXNnXG5cdH07XG59XG5cbmZ1bmN0aW9uIGZhaWwobXNnKVxue1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICc8ZGVjb2Rlcj4nLFxuXHRcdHRhZzogJ2ZhaWwnLFxuXHRcdG1zZzogbXNnXG5cdH07XG59XG5cbmZ1bmN0aW9uIGRlY29kZVByaW1pdGl2ZSh0YWcpXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJzxkZWNvZGVyPicsXG5cdFx0dGFnOiB0YWdcblx0fTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlQ29udGFpbmVyKHRhZywgZGVjb2Rlcilcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnPGRlY29kZXI+Jyxcblx0XHR0YWc6IHRhZyxcblx0XHRkZWNvZGVyOiBkZWNvZGVyXG5cdH07XG59XG5cbmZ1bmN0aW9uIGRlY29kZU51bGwodmFsdWUpXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJzxkZWNvZGVyPicsXG5cdFx0dGFnOiAnbnVsbCcsXG5cdFx0dmFsdWU6IHZhbHVlXG5cdH07XG59XG5cbmZ1bmN0aW9uIGRlY29kZUZpZWxkKGZpZWxkLCBkZWNvZGVyKVxue1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICc8ZGVjb2Rlcj4nLFxuXHRcdHRhZzogJ2ZpZWxkJyxcblx0XHRmaWVsZDogZmllbGQsXG5cdFx0ZGVjb2RlcjogZGVjb2RlclxuXHR9O1xufVxuXG5mdW5jdGlvbiBkZWNvZGVLZXlWYWx1ZVBhaXJzKGRlY29kZXIpXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJzxkZWNvZGVyPicsXG5cdFx0dGFnOiAna2V5LXZhbHVlJyxcblx0XHRkZWNvZGVyOiBkZWNvZGVyXG5cdH07XG59XG5cbmZ1bmN0aW9uIGRlY29kZU9iamVjdChmLCBkZWNvZGVycylcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnPGRlY29kZXI+Jyxcblx0XHR0YWc6ICdtYXAtbWFueScsXG5cdFx0ZnVuYzogZixcblx0XHRkZWNvZGVyczogZGVjb2RlcnNcblx0fTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlVHVwbGUoZiwgZGVjb2RlcnMpXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJzxkZWNvZGVyPicsXG5cdFx0dGFnOiAndHVwbGUnLFxuXHRcdGZ1bmM6IGYsXG5cdFx0ZGVjb2RlcnM6IGRlY29kZXJzXG5cdH07XG59XG5cbmZ1bmN0aW9uIGFuZFRoZW4oZGVjb2RlciwgY2FsbGJhY2spXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJzxkZWNvZGVyPicsXG5cdFx0dGFnOiAnYW5kVGhlbicsXG5cdFx0ZGVjb2RlcjogZGVjb2Rlcixcblx0XHRjYWxsYmFjazogY2FsbGJhY2tcblx0fTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tQW5kVGhlbihkZWNvZGVyLCBjYWxsYmFjaylcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnPGRlY29kZXI+Jyxcblx0XHR0YWc6ICdjdXN0b21BbmRUaGVuJyxcblx0XHRkZWNvZGVyOiBkZWNvZGVyLFxuXHRcdGNhbGxiYWNrOiBjYWxsYmFja1xuXHR9O1xufVxuXG5mdW5jdGlvbiBvbmVPZihkZWNvZGVycylcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnPGRlY29kZXI+Jyxcblx0XHR0YWc6ICdvbmVPZicsXG5cdFx0ZGVjb2RlcnM6IGRlY29kZXJzXG5cdH07XG59XG5cblxuLy8gREVDT0RJTkcgT0JKRUNUU1xuXG5mdW5jdGlvbiBkZWNvZGVPYmplY3QxKGYsIGQxKVxue1xuXHRyZXR1cm4gZGVjb2RlT2JqZWN0KGYsIFtkMV0pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVPYmplY3QyKGYsIGQxLCBkMilcbntcblx0cmV0dXJuIGRlY29kZU9iamVjdChmLCBbZDEsIGQyXSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZU9iamVjdDMoZiwgZDEsIGQyLCBkMylcbntcblx0cmV0dXJuIGRlY29kZU9iamVjdChmLCBbZDEsIGQyLCBkM10pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVPYmplY3Q0KGYsIGQxLCBkMiwgZDMsIGQ0KVxue1xuXHRyZXR1cm4gZGVjb2RlT2JqZWN0KGYsIFtkMSwgZDIsIGQzLCBkNF0pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVPYmplY3Q1KGYsIGQxLCBkMiwgZDMsIGQ0LCBkNSlcbntcblx0cmV0dXJuIGRlY29kZU9iamVjdChmLCBbZDEsIGQyLCBkMywgZDQsIGQ1XSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZU9iamVjdDYoZiwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNilcbntcblx0cmV0dXJuIGRlY29kZU9iamVjdChmLCBbZDEsIGQyLCBkMywgZDQsIGQ1LCBkNl0pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVPYmplY3Q3KGYsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3KVxue1xuXHRyZXR1cm4gZGVjb2RlT2JqZWN0KGYsIFtkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkN10pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVPYmplY3Q4KGYsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOClcbntcblx0cmV0dXJuIGRlY29kZU9iamVjdChmLCBbZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4XSk7XG59XG5cblxuLy8gREVDT0RJTkcgVFVQTEVTXG5cbmZ1bmN0aW9uIGRlY29kZVR1cGxlMShmLCBkMSlcbntcblx0cmV0dXJuIGRlY29kZVR1cGxlKGYsIFtkMV0pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVUdXBsZTIoZiwgZDEsIGQyKVxue1xuXHRyZXR1cm4gZGVjb2RlVHVwbGUoZiwgW2QxLCBkMl0pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVUdXBsZTMoZiwgZDEsIGQyLCBkMylcbntcblx0cmV0dXJuIGRlY29kZVR1cGxlKGYsIFtkMSwgZDIsIGQzXSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZVR1cGxlNChmLCBkMSwgZDIsIGQzLCBkNClcbntcblx0cmV0dXJuIGRlY29kZVR1cGxlKGYsIFtkMSwgZDIsIGQzLCBkNF0pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVUdXBsZTUoZiwgZDEsIGQyLCBkMywgZDQsIGQ1KVxue1xuXHRyZXR1cm4gZGVjb2RlVHVwbGUoZiwgW2QxLCBkMiwgZDMsIGQ0LCBkNV0pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVUdXBsZTYoZiwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNilcbntcblx0cmV0dXJuIGRlY29kZVR1cGxlKGYsIFtkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2XSk7XG59XG5cbmZ1bmN0aW9uIGRlY29kZVR1cGxlNyhmLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNylcbntcblx0cmV0dXJuIGRlY29kZVR1cGxlKGYsIFtkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkN10pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVUdXBsZTgoZiwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcsIGQ4KVxue1xuXHRyZXR1cm4gZGVjb2RlVHVwbGUoZiwgW2QxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOF0pO1xufVxuXG5cbi8vIERFQ09ERSBIRUxQRVJTXG5cbmZ1bmN0aW9uIG9rKHZhbHVlKVxue1xuXHRyZXR1cm4geyB0YWc6ICdvaycsIHZhbHVlOiB2YWx1ZSB9O1xufVxuXG5mdW5jdGlvbiBiYWRQcmltaXRpdmUodHlwZSwgdmFsdWUpXG57XG5cdHJldHVybiB7IHRhZzogJ3ByaW1pdGl2ZScsIHR5cGU6IHR5cGUsIHZhbHVlOiB2YWx1ZSB9O1xufVxuXG5mdW5jdGlvbiBiYWRJbmRleChpbmRleCwgbmVzdGVkUHJvYmxlbXMpXG57XG5cdHJldHVybiB7IHRhZzogJ2luZGV4JywgaW5kZXg6IGluZGV4LCByZXN0OiBuZXN0ZWRQcm9ibGVtcyB9O1xufVxuXG5mdW5jdGlvbiBiYWRGaWVsZChmaWVsZCwgbmVzdGVkUHJvYmxlbXMpXG57XG5cdHJldHVybiB7IHRhZzogJ2ZpZWxkJywgZmllbGQ6IGZpZWxkLCByZXN0OiBuZXN0ZWRQcm9ibGVtcyB9O1xufVxuXG5mdW5jdGlvbiBiYWRPbmVPZihwcm9ibGVtcylcbntcblx0cmV0dXJuIHsgdGFnOiAnb25lT2YnLCBwcm9ibGVtczogcHJvYmxlbXMgfTtcbn1cblxuZnVuY3Rpb24gYmFkQ3VzdG9tKG1zZylcbntcblx0cmV0dXJuIHsgdGFnOiAnY3VzdG9tJywgbXNnOiBtc2cgfTtcbn1cblxuZnVuY3Rpb24gYmFkKG1zZylcbntcblx0cmV0dXJuIHsgdGFnOiAnZmFpbCcsIG1zZzogbXNnIH07XG59XG5cbmZ1bmN0aW9uIGJhZFRvU3RyaW5nKHByb2JsZW0pXG57XG5cdHZhciBjb250ZXh0ID0gJ18nO1xuXHR3aGlsZSAocHJvYmxlbSlcblx0e1xuXHRcdHN3aXRjaCAocHJvYmxlbS50YWcpXG5cdFx0e1xuXHRcdFx0Y2FzZSAncHJpbWl0aXZlJzpcblx0XHRcdFx0cmV0dXJuICdFeHBlY3RpbmcgJyArIHByb2JsZW0udHlwZVxuXHRcdFx0XHRcdCsgKGNvbnRleHQgPT09ICdfJyA/ICcnIDogJyBhdCAnICsgY29udGV4dClcblx0XHRcdFx0XHQrICcgYnV0IGluc3RlYWQgZ290OiAnICsganNUb1N0cmluZyhwcm9ibGVtLnZhbHVlKTtcblxuXHRcdFx0Y2FzZSAnaW5kZXgnOlxuXHRcdFx0XHRjb250ZXh0ICs9ICdbJyArIHByb2JsZW0uaW5kZXggKyAnXSc7XG5cdFx0XHRcdHByb2JsZW0gPSBwcm9ibGVtLnJlc3Q7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdmaWVsZCc6XG5cdFx0XHRcdGNvbnRleHQgKz0gJy4nICsgcHJvYmxlbS5maWVsZDtcblx0XHRcdFx0cHJvYmxlbSA9IHByb2JsZW0ucmVzdDtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ29uZU9mJzpcblx0XHRcdFx0dmFyIHByb2JsZW1zID0gcHJvYmxlbS5wcm9ibGVtcztcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9ibGVtcy5sZW5ndGg7IGkrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHByb2JsZW1zW2ldID0gYmFkVG9TdHJpbmcocHJvYmxlbXNbaV0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAnSSByYW4gaW50byB0aGUgZm9sbG93aW5nIHByb2JsZW1zJ1xuXHRcdFx0XHRcdCsgKGNvbnRleHQgPT09ICdfJyA/ICcnIDogJyBhdCAnICsgY29udGV4dClcblx0XHRcdFx0XHQrICc6XFxuXFxuJyArIHByb2JsZW1zLmpvaW4oJ1xcbicpO1xuXG5cdFx0XHRjYXNlICdjdXN0b20nOlxuXHRcdFx0XHRyZXR1cm4gJ0EgYGN1c3RvbURlY29kZXJgIGZhaWxlZCdcblx0XHRcdFx0XHQrIChjb250ZXh0ID09PSAnXycgPyAnJyA6ICcgYXQgJyArIGNvbnRleHQpXG5cdFx0XHRcdFx0KyAnIHdpdGggdGhlIG1lc3NhZ2U6ICcgKyBwcm9ibGVtLm1zZztcblxuXHRcdFx0Y2FzZSAnZmFpbCc6XG5cdFx0XHRcdHJldHVybiAnSSByYW4gaW50byBhIGBmYWlsYCBkZWNvZGVyJ1xuXHRcdFx0XHRcdCsgKGNvbnRleHQgPT09ICdfJyA/ICcnIDogJyBhdCAnICsgY29udGV4dClcblx0XHRcdFx0XHQrICc6ICcgKyBwcm9ibGVtLm1zZztcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24ganNUb1N0cmluZyh2YWx1ZSlcbntcblx0cmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWRcblx0XHQ/ICd1bmRlZmluZWQnXG5cdFx0OiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG59XG5cblxuLy8gREVDT0RFXG5cbmZ1bmN0aW9uIHJ1bk9uU3RyaW5nKGRlY29kZXIsIHN0cmluZylcbntcblx0dmFyIGpzb247XG5cdHRyeVxuXHR7XG5cdFx0anNvbiA9IEpTT04ucGFyc2Uoc3RyaW5nKTtcblx0fVxuXHRjYXRjaCAoZSlcblx0e1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKCdHaXZlbiBhbiBpbnZhbGlkIEpTT046ICcgKyBlLm1lc3NhZ2UpO1xuXHR9XG5cdHJldHVybiBydW4oZGVjb2RlciwganNvbik7XG59XG5cbmZ1bmN0aW9uIHJ1bihkZWNvZGVyLCB2YWx1ZSlcbntcblx0dmFyIHJlc3VsdCA9IHJ1bkhlbHAoZGVjb2RlciwgdmFsdWUpO1xuXHRyZXR1cm4gKHJlc3VsdC50YWcgPT09ICdvaycpXG5cdFx0PyBfZWxtX2xhbmckY29yZSRSZXN1bHQkT2socmVzdWx0LnZhbHVlKVxuXHRcdDogX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihiYWRUb1N0cmluZyhyZXN1bHQpKTtcbn1cblxuZnVuY3Rpb24gcnVuSGVscChkZWNvZGVyLCB2YWx1ZSlcbntcblx0c3dpdGNoIChkZWNvZGVyLnRhZylcblx0e1xuXHRcdGNhc2UgJ2Jvb2wnOlxuXHRcdFx0cmV0dXJuICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJylcblx0XHRcdFx0PyBvayh2YWx1ZSlcblx0XHRcdFx0OiBiYWRQcmltaXRpdmUoJ2EgQm9vbCcsIHZhbHVlKTtcblxuXHRcdGNhc2UgJ2ludCc6XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykge1xuXHRcdFx0XHRyZXR1cm4gYmFkUHJpbWl0aXZlKCdhbiBJbnQnLCB2YWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICgtMjE0NzQ4MzY0NyA8IHZhbHVlICYmIHZhbHVlIDwgMjE0NzQ4MzY0NyAmJiAodmFsdWUgfCAwKSA9PT0gdmFsdWUpIHtcblx0XHRcdFx0cmV0dXJuIG9rKHZhbHVlKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGlzRmluaXRlKHZhbHVlKSAmJiAhKHZhbHVlICUgMSkpIHtcblx0XHRcdFx0cmV0dXJuIG9rKHZhbHVlKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGJhZFByaW1pdGl2ZSgnYW4gSW50JywgdmFsdWUpO1xuXG5cdFx0Y2FzZSAnZmxvYXQnOlxuXHRcdFx0cmV0dXJuICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKVxuXHRcdFx0XHQ/IG9rKHZhbHVlKVxuXHRcdFx0XHQ6IGJhZFByaW1pdGl2ZSgnYSBGbG9hdCcsIHZhbHVlKTtcblxuXHRcdGNhc2UgJ3N0cmluZyc6XG5cdFx0XHRyZXR1cm4gKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpXG5cdFx0XHRcdD8gb2sodmFsdWUpXG5cdFx0XHRcdDogKHZhbHVlIGluc3RhbmNlb2YgU3RyaW5nKVxuXHRcdFx0XHRcdD8gb2sodmFsdWUgKyAnJylcblx0XHRcdFx0XHQ6IGJhZFByaW1pdGl2ZSgnYSBTdHJpbmcnLCB2YWx1ZSk7XG5cblx0XHRjYXNlICdudWxsJzpcblx0XHRcdHJldHVybiAodmFsdWUgPT09IG51bGwpXG5cdFx0XHRcdD8gb2soZGVjb2Rlci52YWx1ZSlcblx0XHRcdFx0OiBiYWRQcmltaXRpdmUoJ251bGwnLCB2YWx1ZSk7XG5cblx0XHRjYXNlICd2YWx1ZSc6XG5cdFx0XHRyZXR1cm4gb2sodmFsdWUpO1xuXG5cdFx0Y2FzZSAnbGlzdCc6XG5cdFx0XHRpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGJhZFByaW1pdGl2ZSgnYSBMaXN0JywgdmFsdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbGlzdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0Lk5pbDtcblx0XHRcdGZvciAodmFyIGkgPSB2YWx1ZS5sZW5ndGg7IGktLTsgKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgcmVzdWx0ID0gcnVuSGVscChkZWNvZGVyLmRlY29kZXIsIHZhbHVlW2ldKTtcblx0XHRcdFx0aWYgKHJlc3VsdC50YWcgIT09ICdvaycpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gYmFkSW5kZXgoaSwgcmVzdWx0KVxuXHRcdFx0XHR9XG5cdFx0XHRcdGxpc3QgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5Db25zKHJlc3VsdC52YWx1ZSwgbGlzdCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb2sobGlzdCk7XG5cblx0XHRjYXNlICdhcnJheSc6XG5cdFx0XHRpZiAoISh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGJhZFByaW1pdGl2ZSgnYW4gQXJyYXknLCB2YWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBsZW4gPSB2YWx1ZS5sZW5ndGg7XG5cdFx0XHR2YXIgYXJyYXkgPSBuZXcgQXJyYXkobGVuKTtcblx0XHRcdGZvciAodmFyIGkgPSBsZW47IGktLTsgKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgcmVzdWx0ID0gcnVuSGVscChkZWNvZGVyLmRlY29kZXIsIHZhbHVlW2ldKTtcblx0XHRcdFx0aWYgKHJlc3VsdC50YWcgIT09ICdvaycpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gYmFkSW5kZXgoaSwgcmVzdWx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhcnJheVtpXSA9IHJlc3VsdC52YWx1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvayhfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkuZnJvbUpTQXJyYXkoYXJyYXkpKTtcblxuXHRcdGNhc2UgJ21heWJlJzpcblx0XHRcdHZhciByZXN1bHQgPSBydW5IZWxwKGRlY29kZXIuZGVjb2RlciwgdmFsdWUpO1xuXHRcdFx0cmV0dXJuIChyZXN1bHQudGFnID09PSAnb2snKVxuXHRcdFx0XHQ/IG9rKF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QocmVzdWx0LnZhbHVlKSlcblx0XHRcdFx0OiBvayhfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nKTtcblxuXHRcdGNhc2UgJ2ZpZWxkJzpcblx0XHRcdHZhciBmaWVsZCA9IGRlY29kZXIuZmllbGQ7XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCAhKGZpZWxkIGluIHZhbHVlKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGJhZFByaW1pdGl2ZSgnYW4gb2JqZWN0IHdpdGggYSBmaWVsZCBuYW1lZCBgJyArIGZpZWxkICsgJ2AnLCB2YWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciByZXN1bHQgPSBydW5IZWxwKGRlY29kZXIuZGVjb2RlciwgdmFsdWVbZmllbGRdKTtcblx0XHRcdHJldHVybiAocmVzdWx0LnRhZyA9PT0gJ29rJylcblx0XHRcdFx0PyByZXN1bHRcblx0XHRcdFx0OiBiYWRGaWVsZChmaWVsZCwgcmVzdWx0KTtcblxuXHRcdGNhc2UgJ2tleS12YWx1ZSc6XG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gYmFkUHJpbWl0aXZlKCdhbiBvYmplY3QnLCB2YWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBrZXlWYWx1ZVBhaXJzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuTmlsO1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIHZhbHVlKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgcmVzdWx0ID0gcnVuSGVscChkZWNvZGVyLmRlY29kZXIsIHZhbHVlW2tleV0pO1xuXHRcdFx0XHRpZiAocmVzdWx0LnRhZyAhPT0gJ29rJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBiYWRGaWVsZChrZXksIHJlc3VsdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIHBhaXIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuVHVwbGUyKGtleSwgcmVzdWx0LnZhbHVlKTtcblx0XHRcdFx0a2V5VmFsdWVQYWlycyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LkNvbnMocGFpciwga2V5VmFsdWVQYWlycyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb2soa2V5VmFsdWVQYWlycyk7XG5cblx0XHRjYXNlICdtYXAtbWFueSc6XG5cdFx0XHR2YXIgYW5zd2VyID0gZGVjb2Rlci5mdW5jO1xuXHRcdFx0dmFyIGRlY29kZXJzID0gZGVjb2Rlci5kZWNvZGVycztcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGVjb2RlcnMubGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciByZXN1bHQgPSBydW5IZWxwKGRlY29kZXJzW2ldLCB2YWx1ZSk7XG5cdFx0XHRcdGlmIChyZXN1bHQudGFnICE9PSAnb2snKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRhbnN3ZXIgPSBhbnN3ZXIocmVzdWx0LnZhbHVlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvayhhbnN3ZXIpO1xuXG5cdFx0Y2FzZSAndHVwbGUnOlxuXHRcdFx0dmFyIGRlY29kZXJzID0gZGVjb2Rlci5kZWNvZGVycztcblx0XHRcdHZhciBsZW4gPSBkZWNvZGVycy5sZW5ndGg7XG5cblx0XHRcdGlmICggISh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5KSB8fCB2YWx1ZS5sZW5ndGggIT09IGxlbiApXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBiYWRQcmltaXRpdmUoJ2EgVHVwbGUgd2l0aCAnICsgbGVuICsgJyBlbnRyaWVzJywgdmFsdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgYW5zd2VyID0gZGVjb2Rlci5mdW5jO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcblx0XHRcdHtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IHJ1bkhlbHAoZGVjb2RlcnNbaV0sIHZhbHVlW2ldKTtcblx0XHRcdFx0aWYgKHJlc3VsdC50YWcgIT09ICdvaycpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gYmFkSW5kZXgoaSwgcmVzdWx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhbnN3ZXIgPSBhbnN3ZXIocmVzdWx0LnZhbHVlKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvayhhbnN3ZXIpO1xuXG5cdFx0Y2FzZSAnY3VzdG9tQW5kVGhlbic6XG5cdFx0XHR2YXIgcmVzdWx0ID0gcnVuSGVscChkZWNvZGVyLmRlY29kZXIsIHZhbHVlKTtcblx0XHRcdGlmIChyZXN1bHQudGFnICE9PSAnb2snKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fVxuXHRcdFx0dmFyIHJlYWxSZXN1bHQgPSBkZWNvZGVyLmNhbGxiYWNrKHJlc3VsdC52YWx1ZSk7XG5cdFx0XHRpZiAocmVhbFJlc3VsdC5jdG9yID09PSAnRXJyJylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGJhZEN1c3RvbShyZWFsUmVzdWx0Ll8wKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvayhyZWFsUmVzdWx0Ll8wKTtcblxuXHRcdGNhc2UgJ2FuZFRoZW4nOlxuXHRcdFx0dmFyIHJlc3VsdCA9IHJ1bkhlbHAoZGVjb2Rlci5kZWNvZGVyLCB2YWx1ZSk7XG5cdFx0XHRyZXR1cm4gKHJlc3VsdC50YWcgIT09ICdvaycpXG5cdFx0XHRcdD8gcmVzdWx0XG5cdFx0XHRcdDogcnVuSGVscChkZWNvZGVyLmNhbGxiYWNrKHJlc3VsdC52YWx1ZSksIHZhbHVlKTtcblxuXHRcdGNhc2UgJ29uZU9mJzpcblx0XHRcdHZhciBlcnJvcnMgPSBbXTtcblx0XHRcdHZhciB0ZW1wID0gZGVjb2Rlci5kZWNvZGVycztcblx0XHRcdHdoaWxlICh0ZW1wLmN0b3IgIT09ICdbXScpXG5cdFx0XHR7XG5cdFx0XHRcdHZhciByZXN1bHQgPSBydW5IZWxwKHRlbXAuXzAsIHZhbHVlKTtcblxuXHRcdFx0XHRpZiAocmVzdWx0LnRhZyA9PT0gJ29rJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRlcnJvcnMucHVzaChyZXN1bHQpO1xuXG5cdFx0XHRcdHRlbXAgPSB0ZW1wLl8xO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGJhZE9uZU9mKGVycm9ycyk7XG5cblx0XHRjYXNlICdmYWlsJzpcblx0XHRcdHJldHVybiBiYWQoZGVjb2Rlci5tc2cpO1xuXG5cdFx0Y2FzZSAnc3VjY2VlZCc6XG5cdFx0XHRyZXR1cm4gb2soZGVjb2Rlci5tc2cpO1xuXHR9XG59XG5cblxuLy8gRVFVQUxJVFlcblxuZnVuY3Rpb24gZXF1YWxpdHkoYSwgYilcbntcblx0aWYgKGEgPT09IGIpXG5cdHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmIChhLnRhZyAhPT0gYi50YWcpXG5cdHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRzd2l0Y2ggKGEudGFnKVxuXHR7XG5cdFx0Y2FzZSAnc3VjY2VlZCc6XG5cdFx0Y2FzZSAnZmFpbCc6XG5cdFx0XHRyZXR1cm4gYS5tc2cgPT09IGIubXNnO1xuXG5cdFx0Y2FzZSAnYm9vbCc6XG5cdFx0Y2FzZSAnaW50Jzpcblx0XHRjYXNlICdmbG9hdCc6XG5cdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRjYXNlICd2YWx1ZSc6XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblxuXHRcdGNhc2UgJ251bGwnOlxuXHRcdFx0cmV0dXJuIGEudmFsdWUgPT09IGIudmFsdWU7XG5cblx0XHRjYXNlICdsaXN0Jzpcblx0XHRjYXNlICdhcnJheSc6XG5cdFx0Y2FzZSAnbWF5YmUnOlxuXHRcdGNhc2UgJ2tleS12YWx1ZSc6XG5cdFx0XHRyZXR1cm4gZXF1YWxpdHkoYS5kZWNvZGVyLCBiLmRlY29kZXIpO1xuXG5cdFx0Y2FzZSAnZmllbGQnOlxuXHRcdFx0cmV0dXJuIGEuZmllbGQgPT09IGIuZmllbGQgJiYgZXF1YWxpdHkoYS5kZWNvZGVyLCBiLmRlY29kZXIpO1xuXG5cdFx0Y2FzZSAnbWFwLW1hbnknOlxuXHRcdGNhc2UgJ3R1cGxlJzpcblx0XHRcdGlmIChhLmZ1bmMgIT09IGIuZnVuYylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGxpc3RFcXVhbGl0eShhLmRlY29kZXJzLCBiLmRlY29kZXJzKTtcblxuXHRcdGNhc2UgJ2FuZFRoZW4nOlxuXHRcdGNhc2UgJ2N1c3RvbUFuZFRoZW4nOlxuXHRcdFx0cmV0dXJuIGEuY2FsbGJhY2sgPT09IGIuY2FsbGJhY2sgJiYgZXF1YWxpdHkoYS5kZWNvZGVyLCBiLmRlY29kZXIpO1xuXG5cdFx0Y2FzZSAnb25lT2YnOlxuXHRcdFx0cmV0dXJuIGxpc3RFcXVhbGl0eShhLmRlY29kZXJzLCBiLmRlY29kZXJzKTtcblx0fVxufVxuXG5mdW5jdGlvbiBsaXN0RXF1YWxpdHkoYURlY29kZXJzLCBiRGVjb2RlcnMpXG57XG5cdHZhciBsZW4gPSBhRGVjb2RlcnMubGVuZ3RoO1xuXHRpZiAobGVuICE9PSBiRGVjb2RlcnMubGVuZ3RoKVxuXHR7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG5cdHtcblx0XHRpZiAoIWVxdWFsaXR5KGFEZWNvZGVyc1tpXSwgYkRlY29kZXJzW2ldKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0cnVlO1xufVxuXG5cbi8vIEVOQ09ERVxuXG5mdW5jdGlvbiBlbmNvZGUoaW5kZW50TGV2ZWwsIHZhbHVlKVxue1xuXHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIGluZGVudExldmVsKTtcbn1cblxuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpXG57XG5cdHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gZW5jb2RlT2JqZWN0KGtleVZhbHVlUGFpcnMpXG57XG5cdHZhciBvYmogPSB7fTtcblx0d2hpbGUgKGtleVZhbHVlUGFpcnMuY3RvciAhPT0gJ1tdJylcblx0e1xuXHRcdHZhciBwYWlyID0ga2V5VmFsdWVQYWlycy5fMDtcblx0XHRvYmpbcGFpci5fMF0gPSBwYWlyLl8xO1xuXHRcdGtleVZhbHVlUGFpcnMgPSBrZXlWYWx1ZVBhaXJzLl8xO1xuXHR9XG5cdHJldHVybiBvYmo7XG59XG5cbnJldHVybiB7XG5cdGVuY29kZTogRjIoZW5jb2RlKSxcblx0cnVuT25TdHJpbmc6IEYyKHJ1bk9uU3RyaW5nKSxcblx0cnVuOiBGMihydW4pLFxuXG5cdGRlY29kZU51bGw6IGRlY29kZU51bGwsXG5cdGRlY29kZVByaW1pdGl2ZTogZGVjb2RlUHJpbWl0aXZlLFxuXHRkZWNvZGVDb250YWluZXI6IEYyKGRlY29kZUNvbnRhaW5lciksXG5cblx0ZGVjb2RlRmllbGQ6IEYyKGRlY29kZUZpZWxkKSxcblxuXHRkZWNvZGVPYmplY3QxOiBGMihkZWNvZGVPYmplY3QxKSxcblx0ZGVjb2RlT2JqZWN0MjogRjMoZGVjb2RlT2JqZWN0MiksXG5cdGRlY29kZU9iamVjdDM6IEY0KGRlY29kZU9iamVjdDMpLFxuXHRkZWNvZGVPYmplY3Q0OiBGNShkZWNvZGVPYmplY3Q0KSxcblx0ZGVjb2RlT2JqZWN0NTogRjYoZGVjb2RlT2JqZWN0NSksXG5cdGRlY29kZU9iamVjdDY6IEY3KGRlY29kZU9iamVjdDYpLFxuXHRkZWNvZGVPYmplY3Q3OiBGOChkZWNvZGVPYmplY3Q3KSxcblx0ZGVjb2RlT2JqZWN0ODogRjkoZGVjb2RlT2JqZWN0OCksXG5cdGRlY29kZUtleVZhbHVlUGFpcnM6IGRlY29kZUtleVZhbHVlUGFpcnMsXG5cblx0ZGVjb2RlVHVwbGUxOiBGMihkZWNvZGVUdXBsZTEpLFxuXHRkZWNvZGVUdXBsZTI6IEYzKGRlY29kZVR1cGxlMiksXG5cdGRlY29kZVR1cGxlMzogRjQoZGVjb2RlVHVwbGUzKSxcblx0ZGVjb2RlVHVwbGU0OiBGNShkZWNvZGVUdXBsZTQpLFxuXHRkZWNvZGVUdXBsZTU6IEY2KGRlY29kZVR1cGxlNSksXG5cdGRlY29kZVR1cGxlNjogRjcoZGVjb2RlVHVwbGU2KSxcblx0ZGVjb2RlVHVwbGU3OiBGOChkZWNvZGVUdXBsZTcpLFxuXHRkZWNvZGVUdXBsZTg6IEY5KGRlY29kZVR1cGxlOCksXG5cblx0YW5kVGhlbjogRjIoYW5kVGhlbiksXG5cdGN1c3RvbUFuZFRoZW46IEYyKGN1c3RvbUFuZFRoZW4pLFxuXHRmYWlsOiBmYWlsLFxuXHRzdWNjZWVkOiBzdWNjZWVkLFxuXHRvbmVPZjogb25lT2YsXG5cblx0aWRlbnRpdHk6IGlkZW50aXR5LFxuXHRlbmNvZGVOdWxsOiBudWxsLFxuXHRlbmNvZGVBcnJheTogX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LnRvSlNBcnJheSxcblx0ZW5jb2RlTGlzdDogX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QudG9BcnJheSxcblx0ZW5jb2RlT2JqZWN0OiBlbmNvZGVPYmplY3QsXG5cblx0ZXF1YWxpdHk6IGVxdWFsaXR5XG59O1xuXG59KCk7XG5cbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0VuY29kZSRsaXN0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZW5jb2RlTGlzdDtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0VuY29kZSRhcnJheSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmVuY29kZUFycmF5O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRW5jb2RlJG9iamVjdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmVuY29kZU9iamVjdDtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0VuY29kZSRudWxsID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZW5jb2RlTnVsbDtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0VuY29kZSRib29sID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uaWRlbnRpdHk7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9FbmNvZGUkZmxvYXQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5pZGVudGl0eTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0VuY29kZSRpbnQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5pZGVudGl0eTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0VuY29kZSRzdHJpbmcgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5pZGVudGl0eTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0VuY29kZSRlbmNvZGUgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5lbmNvZGU7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9FbmNvZGUkVmFsdWUgPSB7Y3RvcjogJ1ZhbHVlJ307XG5cbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSR0dXBsZTggPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVUdXBsZTg7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkdHVwbGU3ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlVHVwbGU3O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHR1cGxlNiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZVR1cGxlNjtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSR0dXBsZTUgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVUdXBsZTU7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkdHVwbGU0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlVHVwbGU0O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHR1cGxlMyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZVR1cGxlMztcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSR0dXBsZTIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVUdXBsZTI7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkdHVwbGUxID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlVHVwbGUxO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHN1Y2NlZWQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5zdWNjZWVkO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGZhaWwgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5mYWlsO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGFuZFRoZW4gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5hbmRUaGVuO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGN1c3RvbURlY29kZXIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5jdXN0b21BbmRUaGVuO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGRlY29kZVZhbHVlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24ucnVuO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHZhbHVlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlUHJpbWl0aXZlKCd2YWx1ZScpO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG1heWJlID0gZnVuY3Rpb24gKGRlY29kZXIpIHtcblx0cmV0dXJuIEEyKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZUNvbnRhaW5lciwgJ21heWJlJywgZGVjb2Rlcik7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG51bGwgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVOdWxsO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGFycmF5ID0gZnVuY3Rpb24gKGRlY29kZXIpIHtcblx0cmV0dXJuIEEyKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZUNvbnRhaW5lciwgJ2FycmF5JywgZGVjb2Rlcik7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGxpc3QgPSBmdW5jdGlvbiAoZGVjb2Rlcikge1xuXHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlQ29udGFpbmVyLCAnbGlzdCcsIGRlY29kZXIpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRib29sID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlUHJpbWl0aXZlKCdib29sJyk7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkaW50ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlUHJpbWl0aXZlKCdpbnQnKTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRmbG9hdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZVByaW1pdGl2ZSgnZmxvYXQnKTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRzdHJpbmcgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVQcmltaXRpdmUoJ3N0cmluZycpO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG9uZU9mID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24ub25lT2Y7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUka2V5VmFsdWVQYWlycyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZUtleVZhbHVlUGFpcnM7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkb2JqZWN0OCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZU9iamVjdDg7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkb2JqZWN0NyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZU9iamVjdDc7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkb2JqZWN0NiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZU9iamVjdDY7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkb2JqZWN0NSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZU9iamVjdDU7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkb2JqZWN0NCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZU9iamVjdDQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkb2JqZWN0MyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZU9iamVjdDM7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkb2JqZWN0MiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZU9iamVjdDI7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkb2JqZWN0MSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZU9iamVjdDE7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGVfb3BzID0gX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGVfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGVfb3BzWyc6PSddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlRmllbGQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkYXQgPSBGMihcblx0ZnVuY3Rpb24gKGZpZWxkcywgZGVjb2Rlcikge1xuXHRcdHJldHVybiBBMyhcblx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZHIsXG5cdFx0XHRGMihcblx0XHRcdFx0ZnVuY3Rpb24gKHgsIHkpIHtcblx0XHRcdFx0XHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGVfb3BzWyc6PSddLCB4LCB5KTtcblx0XHRcdFx0fSksXG5cdFx0XHRkZWNvZGVyLFxuXHRcdFx0ZmllbGRzKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkZGVjb2RlU3RyaW5nID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24ucnVuT25TdHJpbmc7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkbWFwID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlT2JqZWN0MTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRkaWN0ID0gZnVuY3Rpb24gKGRlY29kZXIpIHtcblx0cmV0dXJuIEEyKFxuXHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG1hcCxcblx0XHRfZWxtX2xhbmckY29yZSREaWN0JGZyb21MaXN0LFxuXHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGtleVZhbHVlUGFpcnMoZGVjb2RlcikpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSREZWNvZGVyID0ge2N0b3I6ICdEZWNvZGVyJ307XG5cbi8vaW1wb3J0IE5hdGl2ZS5Kc29uIC8vXG5cbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kTmF0aXZlX1ZpcnR1YWxEb20gPSBmdW5jdGlvbigpIHtcblxudmFyIFNUWUxFX0tFWSA9ICdTVFlMRSc7XG52YXIgRVZFTlRfS0VZID0gJ0VWRU5UJztcbnZhciBBVFRSX0tFWSA9ICdBVFRSJztcbnZhciBBVFRSX05TX0tFWSA9ICdBVFRSX05TJztcblxuXG5cbi8vLy8vLy8vLy8vLyAgVklSVFVBTCBET00gTk9ERVMgIC8vLy8vLy8vLy8vL1xuXG5cbmZ1bmN0aW9uIHRleHQoc3RyaW5nKVxue1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICd0ZXh0Jyxcblx0XHR0ZXh0OiBzdHJpbmdcblx0fTtcbn1cblxuXG5mdW5jdGlvbiBub2RlKHRhZylcbntcblx0cmV0dXJuIEYyKGZ1bmN0aW9uKGZhY3RMaXN0LCBraWRMaXN0KSB7XG5cdFx0cmV0dXJuIG5vZGVIZWxwKHRhZywgZmFjdExpc3QsIGtpZExpc3QpO1xuXHR9KTtcbn1cblxuXG5mdW5jdGlvbiBub2RlSGVscCh0YWcsIGZhY3RMaXN0LCBraWRMaXN0KVxue1xuXHR2YXIgb3JnYW5pemVkID0gb3JnYW5pemVGYWN0cyhmYWN0TGlzdCk7XG5cdHZhciBuYW1lc3BhY2UgPSBvcmdhbml6ZWQubmFtZXNwYWNlO1xuXHR2YXIgZmFjdHMgPSBvcmdhbml6ZWQuZmFjdHM7XG5cblx0dmFyIGNoaWxkcmVuID0gW107XG5cdHZhciBkZXNjZW5kYW50c0NvdW50ID0gMDtcblx0d2hpbGUgKGtpZExpc3QuY3RvciAhPT0gJ1tdJylcblx0e1xuXHRcdHZhciBraWQgPSBraWRMaXN0Ll8wO1xuXHRcdGRlc2NlbmRhbnRzQ291bnQgKz0gKGtpZC5kZXNjZW5kYW50c0NvdW50IHx8IDApO1xuXHRcdGNoaWxkcmVuLnB1c2goa2lkKTtcblx0XHRraWRMaXN0ID0ga2lkTGlzdC5fMTtcblx0fVxuXHRkZXNjZW5kYW50c0NvdW50ICs9IGNoaWxkcmVuLmxlbmd0aDtcblxuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdub2RlJyxcblx0XHR0YWc6IHRhZyxcblx0XHRmYWN0czogZmFjdHMsXG5cdFx0Y2hpbGRyZW46IGNoaWxkcmVuLFxuXHRcdG5hbWVzcGFjZTogbmFtZXNwYWNlLFxuXHRcdGRlc2NlbmRhbnRzQ291bnQ6IGRlc2NlbmRhbnRzQ291bnRcblx0fTtcbn1cblxuXG5mdW5jdGlvbiBrZXllZE5vZGUodGFnLCBmYWN0TGlzdCwga2lkTGlzdClcbntcblx0dmFyIG9yZ2FuaXplZCA9IG9yZ2FuaXplRmFjdHMoZmFjdExpc3QpO1xuXHR2YXIgbmFtZXNwYWNlID0gb3JnYW5pemVkLm5hbWVzcGFjZTtcblx0dmFyIGZhY3RzID0gb3JnYW5pemVkLmZhY3RzO1xuXG5cdHZhciBjaGlsZHJlbiA9IFtdO1xuXHR2YXIgZGVzY2VuZGFudHNDb3VudCA9IDA7XG5cdHdoaWxlIChraWRMaXN0LmN0b3IgIT09ICdbXScpXG5cdHtcblx0XHR2YXIga2lkID0ga2lkTGlzdC5fMDtcblx0XHRkZXNjZW5kYW50c0NvdW50ICs9IChraWQuXzEuZGVzY2VuZGFudHNDb3VudCB8fCAwKTtcblx0XHRjaGlsZHJlbi5wdXNoKGtpZCk7XG5cdFx0a2lkTGlzdCA9IGtpZExpc3QuXzE7XG5cdH1cblx0ZGVzY2VuZGFudHNDb3VudCArPSBjaGlsZHJlbi5sZW5ndGg7XG5cblx0cmV0dXJuIHtcblx0XHR0eXBlOiAna2V5ZWQtbm9kZScsXG5cdFx0dGFnOiB0YWcsXG5cdFx0ZmFjdHM6IGZhY3RzLFxuXHRcdGNoaWxkcmVuOiBjaGlsZHJlbixcblx0XHRuYW1lc3BhY2U6IG5hbWVzcGFjZSxcblx0XHRkZXNjZW5kYW50c0NvdW50OiBkZXNjZW5kYW50c0NvdW50XG5cdH07XG59XG5cblxuZnVuY3Rpb24gY3VzdG9tKGZhY3RMaXN0LCBtb2RlbCwgaW1wbClcbntcblx0dmFyIGZhY3RzID0gb3JnYW5pemVGYWN0cyhmYWN0TGlzdCkuZmFjdHM7XG5cblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnY3VzdG9tJyxcblx0XHRmYWN0czogZmFjdHMsXG5cdFx0bW9kZWw6IG1vZGVsLFxuXHRcdGltcGw6IGltcGxcblx0fTtcbn1cblxuXG5mdW5jdGlvbiBtYXAodGFnZ2VyLCBub2RlKVxue1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICd0YWdnZXInLFxuXHRcdHRhZ2dlcjogdGFnZ2VyLFxuXHRcdG5vZGU6IG5vZGUsXG5cdFx0ZGVzY2VuZGFudHNDb3VudDogMSArIChub2RlLmRlc2NlbmRhbnRzQ291bnQgfHwgMClcblx0fTtcbn1cblxuXG5mdW5jdGlvbiB0aHVuayhmdW5jLCBhcmdzLCB0aHVuaylcbntcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAndGh1bmsnLFxuXHRcdGZ1bmM6IGZ1bmMsXG5cdFx0YXJnczogYXJncyxcblx0XHR0aHVuazogdGh1bmssXG5cdFx0bm9kZTogdW5kZWZpbmVkXG5cdH07XG59XG5cbmZ1bmN0aW9uIGxhenkoZm4sIGEpXG57XG5cdHJldHVybiB0aHVuayhmbiwgW2FdLCBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gZm4oYSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBsYXp5MihmbiwgYSwgYilcbntcblx0cmV0dXJuIHRodW5rKGZuLCBbYSxiXSwgZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIEEyKGZuLCBhLCBiKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGxhenkzKGZuLCBhLCBiLCBjKVxue1xuXHRyZXR1cm4gdGh1bmsoZm4sIFthLGIsY10sIGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBBMyhmbiwgYSwgYiwgYyk7XG5cdH0pO1xufVxuXG5cblxuLy8gRkFDVFNcblxuXG5mdW5jdGlvbiBvcmdhbml6ZUZhY3RzKGZhY3RMaXN0KVxue1xuXHR2YXIgbmFtZXNwYWNlLCBmYWN0cyA9IHt9O1xuXG5cdHdoaWxlIChmYWN0TGlzdC5jdG9yICE9PSAnW10nKVxuXHR7XG5cdFx0dmFyIGVudHJ5ID0gZmFjdExpc3QuXzA7XG5cdFx0dmFyIGtleSA9IGVudHJ5LmtleTtcblxuXHRcdGlmIChrZXkgPT09IEFUVFJfS0VZIHx8IGtleSA9PT0gQVRUUl9OU19LRVkgfHwga2V5ID09PSBFVkVOVF9LRVkpXG5cdFx0e1xuXHRcdFx0dmFyIHN1YkZhY3RzID0gZmFjdHNba2V5XSB8fCB7fTtcblx0XHRcdHN1YkZhY3RzW2VudHJ5LnJlYWxLZXldID0gZW50cnkudmFsdWU7XG5cdFx0XHRmYWN0c1trZXldID0gc3ViRmFjdHM7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGtleSA9PT0gU1RZTEVfS0VZKVxuXHRcdHtcblx0XHRcdHZhciBzdHlsZXMgPSBmYWN0c1trZXldIHx8IHt9O1xuXHRcdFx0dmFyIHN0eWxlTGlzdCA9IGVudHJ5LnZhbHVlO1xuXHRcdFx0d2hpbGUgKHN0eWxlTGlzdC5jdG9yICE9PSAnW10nKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgc3R5bGUgPSBzdHlsZUxpc3QuXzA7XG5cdFx0XHRcdHN0eWxlc1tzdHlsZS5fMF0gPSBzdHlsZS5fMTtcblx0XHRcdFx0c3R5bGVMaXN0ID0gc3R5bGVMaXN0Ll8xO1xuXHRcdFx0fVxuXHRcdFx0ZmFjdHNba2V5XSA9IHN0eWxlcztcblx0XHR9XG5cdFx0ZWxzZSBpZiAoa2V5ID09PSAnbmFtZXNwYWNlJylcblx0XHR7XG5cdFx0XHRuYW1lc3BhY2UgPSBlbnRyeS52YWx1ZTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGZhY3RzW2tleV0gPSBlbnRyeS52YWx1ZTtcblx0XHR9XG5cdFx0ZmFjdExpc3QgPSBmYWN0TGlzdC5fMTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0ZmFjdHM6IGZhY3RzLFxuXHRcdG5hbWVzcGFjZTogbmFtZXNwYWNlXG5cdH07XG59XG5cblxuXG4vLy8vLy8vLy8vLy8gIFBST1BFUlRJRVMgQU5EIEFUVFJJQlVURVMgIC8vLy8vLy8vLy8vL1xuXG5cbmZ1bmN0aW9uIHN0eWxlKHZhbHVlKVxue1xuXHRyZXR1cm4ge1xuXHRcdGtleTogU1RZTEVfS0VZLFxuXHRcdHZhbHVlOiB2YWx1ZVxuXHR9O1xufVxuXG5cbmZ1bmN0aW9uIHByb3BlcnR5KGtleSwgdmFsdWUpXG57XG5cdHJldHVybiB7XG5cdFx0a2V5OiBrZXksXG5cdFx0dmFsdWU6IHZhbHVlXG5cdH07XG59XG5cblxuZnVuY3Rpb24gYXR0cmlidXRlKGtleSwgdmFsdWUpXG57XG5cdHJldHVybiB7XG5cdFx0a2V5OiBBVFRSX0tFWSxcblx0XHRyZWFsS2V5OiBrZXksXG5cdFx0dmFsdWU6IHZhbHVlXG5cdH07XG59XG5cblxuZnVuY3Rpb24gYXR0cmlidXRlTlMobmFtZXNwYWNlLCBrZXksIHZhbHVlKVxue1xuXHRyZXR1cm4ge1xuXHRcdGtleTogQVRUUl9OU19LRVksXG5cdFx0cmVhbEtleToga2V5LFxuXHRcdHZhbHVlOiB7XG5cdFx0XHR2YWx1ZTogdmFsdWUsXG5cdFx0XHRuYW1lc3BhY2U6IG5hbWVzcGFjZVxuXHRcdH1cblx0fTtcbn1cblxuXG5mdW5jdGlvbiBvbihuYW1lLCBvcHRpb25zLCBkZWNvZGVyKVxue1xuXHRyZXR1cm4ge1xuXHRcdGtleTogRVZFTlRfS0VZLFxuXHRcdHJlYWxLZXk6IG5hbWUsXG5cdFx0dmFsdWU6IHtcblx0XHRcdG9wdGlvbnM6IG9wdGlvbnMsXG5cdFx0XHRkZWNvZGVyOiBkZWNvZGVyXG5cdFx0fVxuXHR9O1xufVxuXG5cbmZ1bmN0aW9uIGVxdWFsRXZlbnRzKGEsIGIpXG57XG5cdGlmICghYS5vcHRpb25zID09PSBiLm9wdGlvbnMpXG5cdHtcblx0XHRpZiAoYS5zdG9wUHJvcGFnYXRpb24gIT09IGIuc3RvcFByb3BhZ2F0aW9uIHx8IGEucHJldmVudERlZmF1bHQgIT09IGIucHJldmVudERlZmF1bHQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZXF1YWxpdHkoYS5kZWNvZGVyLCBiLmRlY29kZXIpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vICBSRU5ERVJFUiAgLy8vLy8vLy8vLy8vXG5cblxuZnVuY3Rpb24gcmVuZGVyZXIocGFyZW50LCB0YWdnZXIsIGluaXRpYWxWaXJ0dWFsTm9kZSlcbntcblx0dmFyIGV2ZW50Tm9kZSA9IHsgdGFnZ2VyOiB0YWdnZXIsIHBhcmVudDogdW5kZWZpbmVkIH07XG5cblx0dmFyIGRvbU5vZGUgPSByZW5kZXIoaW5pdGlhbFZpcnR1YWxOb2RlLCBldmVudE5vZGUpO1xuXHRwYXJlbnQuYXBwZW5kQ2hpbGQoZG9tTm9kZSk7XG5cblx0dmFyIHN0YXRlID0gJ05PX1JFUVVFU1QnO1xuXHR2YXIgY3VycmVudFZpcnR1YWxOb2RlID0gaW5pdGlhbFZpcnR1YWxOb2RlO1xuXHR2YXIgbmV4dFZpcnR1YWxOb2RlID0gaW5pdGlhbFZpcnR1YWxOb2RlO1xuXG5cdGZ1bmN0aW9uIHJlZ2lzdGVyVmlydHVhbE5vZGUodk5vZGUpXG5cdHtcblx0XHRpZiAoc3RhdGUgPT09ICdOT19SRVFVRVNUJylcblx0XHR7XG5cdFx0XHRyQUYodXBkYXRlSWZOZWVkZWQpO1xuXHRcdH1cblx0XHRzdGF0ZSA9ICdQRU5ESU5HX1JFUVVFU1QnO1xuXHRcdG5leHRWaXJ0dWFsTm9kZSA9IHZOb2RlO1xuXHR9XG5cblx0ZnVuY3Rpb24gdXBkYXRlSWZOZWVkZWQoKVxuXHR7XG5cdFx0c3dpdGNoIChzdGF0ZSlcblx0XHR7XG5cdFx0XHRjYXNlICdOT19SRVFVRVNUJzpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdCdVbmV4cGVjdGVkIGRyYXcgY2FsbGJhY2suXFxuJyArXG5cdFx0XHRcdFx0J1BsZWFzZSByZXBvcnQgdGhpcyB0byA8aHR0cHM6Ly9naXRodWIuY29tL2VsbS1sYW5nL2NvcmUvaXNzdWVzPi4nXG5cdFx0XHRcdCk7XG5cblx0XHRcdGNhc2UgJ1BFTkRJTkdfUkVRVUVTVCc6XG5cdFx0XHRcdHJBRih1cGRhdGVJZk5lZWRlZCk7XG5cdFx0XHRcdHN0YXRlID0gJ0VYVFJBX1JFUVVFU1QnO1xuXG5cdFx0XHRcdHZhciBwYXRjaGVzID0gZGlmZihjdXJyZW50VmlydHVhbE5vZGUsIG5leHRWaXJ0dWFsTm9kZSk7XG5cdFx0XHRcdGRvbU5vZGUgPSBhcHBseVBhdGNoZXMoZG9tTm9kZSwgY3VycmVudFZpcnR1YWxOb2RlLCBwYXRjaGVzLCBldmVudE5vZGUpO1xuXHRcdFx0XHRjdXJyZW50VmlydHVhbE5vZGUgPSBuZXh0VmlydHVhbE5vZGU7XG5cblx0XHRcdFx0cmV0dXJuO1xuXG5cdFx0XHRjYXNlICdFWFRSQV9SRVFVRVNUJzpcblx0XHRcdFx0c3RhdGUgPSAnTk9fUkVRVUVTVCc7XG5cdFx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4geyB1cGRhdGU6IHJlZ2lzdGVyVmlydHVhbE5vZGUgfTtcbn1cblxuXG52YXIgckFGID1cblx0dHlwZW9mIHJlcXVlc3RBbmltYXRpb25GcmFtZSAhPT0gJ3VuZGVmaW5lZCdcblx0XHQ/IHJlcXVlc3RBbmltYXRpb25GcmFtZVxuXHRcdDogZnVuY3Rpb24oY2IpIHsgc2V0VGltZW91dChjYiwgMTAwMCAvIDYwKTsgfTtcblxuXG5cbi8vLy8vLy8vLy8vLyAgUkVOREVSICAvLy8vLy8vLy8vLy9cblxuXG5mdW5jdGlvbiByZW5kZXIodk5vZGUsIGV2ZW50Tm9kZSlcbntcblx0c3dpdGNoICh2Tm9kZS50eXBlKVxuXHR7XG5cdFx0Y2FzZSAndGh1bmsnOlxuXHRcdFx0aWYgKCF2Tm9kZS5ub2RlKVxuXHRcdFx0e1xuXHRcdFx0XHR2Tm9kZS5ub2RlID0gdk5vZGUudGh1bmsoKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiByZW5kZXIodk5vZGUubm9kZSwgZXZlbnROb2RlKTtcblxuXHRcdGNhc2UgJ3RhZ2dlcic6XG5cdFx0XHR2YXIgc3ViTm9kZSA9IHZOb2RlLm5vZGU7XG5cdFx0XHR2YXIgdGFnZ2VyID0gdk5vZGUudGFnZ2VyO1xuXG5cdFx0XHR3aGlsZSAoc3ViTm9kZS50eXBlID09PSAndGFnZ2VyJylcblx0XHRcdHtcblx0XHRcdFx0dHlwZW9mIHRhZ2dlciAhPT0gJ29iamVjdCdcblx0XHRcdFx0XHQ/IHRhZ2dlciA9IFt0YWdnZXIsIHN1Yk5vZGUudGFnZ2VyXVxuXHRcdFx0XHRcdDogdGFnZ2VyLnB1c2goc3ViTm9kZS50YWdnZXIpO1xuXG5cdFx0XHRcdHN1Yk5vZGUgPSBzdWJOb2RlLm5vZGU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBzdWJFdmVudFJvb3QgPSB7XG5cdFx0XHRcdHRhZ2dlcjogdGFnZ2VyLFxuXHRcdFx0XHRwYXJlbnQ6IGV2ZW50Tm9kZVxuXHRcdFx0fTtcblxuXHRcdFx0dmFyIGRvbU5vZGUgPSByZW5kZXIoc3ViTm9kZSwgc3ViRXZlbnRSb290KTtcblx0XHRcdGRvbU5vZGUuZWxtX2V2ZW50X25vZGVfcmVmID0gc3ViRXZlbnRSb290O1xuXHRcdFx0cmV0dXJuIGRvbU5vZGU7XG5cblx0XHRjYXNlICd0ZXh0Jzpcblx0XHRcdHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh2Tm9kZS50ZXh0KTtcblxuXHRcdGNhc2UgJ25vZGUnOlxuXHRcdFx0dmFyIGRvbU5vZGUgPSB2Tm9kZS5uYW1lc3BhY2Vcblx0XHRcdFx0PyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlModk5vZGUubmFtZXNwYWNlLCB2Tm9kZS50YWcpXG5cdFx0XHRcdDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh2Tm9kZS50YWcpO1xuXG5cdFx0XHRhcHBseUZhY3RzKGRvbU5vZGUsIGV2ZW50Tm9kZSwgdk5vZGUuZmFjdHMpO1xuXG5cdFx0XHR2YXIgY2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlbjtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0ZG9tTm9kZS5hcHBlbmRDaGlsZChyZW5kZXIoY2hpbGRyZW5baV0sIGV2ZW50Tm9kZSkpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZG9tTm9kZTtcblxuXHRcdGNhc2UgJ2tleWVkLW5vZGUnOlxuXHRcdFx0dmFyIGRvbU5vZGUgPSB2Tm9kZS5uYW1lc3BhY2Vcblx0XHRcdFx0PyBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlModk5vZGUubmFtZXNwYWNlLCB2Tm9kZS50YWcpXG5cdFx0XHRcdDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh2Tm9kZS50YWcpO1xuXG5cdFx0XHRhcHBseUZhY3RzKGRvbU5vZGUsIGV2ZW50Tm9kZSwgdk5vZGUuZmFjdHMpO1xuXG5cdFx0XHR2YXIgY2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlbjtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0ZG9tTm9kZS5hcHBlbmRDaGlsZChyZW5kZXIoY2hpbGRyZW5baV0uXzEsIGV2ZW50Tm9kZSkpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZG9tTm9kZTtcblxuXHRcdGNhc2UgJ2N1c3RvbSc6XG5cdFx0XHR2YXIgZG9tTm9kZSA9IHZOb2RlLmltcGwucmVuZGVyKHZOb2RlLm1vZGVsKTtcblx0XHRcdGFwcGx5RmFjdHMoZG9tTm9kZSwgZXZlbnROb2RlLCB2Tm9kZS5mYWN0cyk7XG5cdFx0XHRyZXR1cm4gZG9tTm9kZTtcblx0fVxufVxuXG5cblxuLy8vLy8vLy8vLy8vICBBUFBMWSBGQUNUUyAgLy8vLy8vLy8vLy8vXG5cblxuZnVuY3Rpb24gYXBwbHlGYWN0cyhkb21Ob2RlLCBldmVudE5vZGUsIGZhY3RzKVxue1xuXHRmb3IgKHZhciBrZXkgaW4gZmFjdHMpXG5cdHtcblx0XHR2YXIgdmFsdWUgPSBmYWN0c1trZXldO1xuXG5cdFx0c3dpdGNoIChrZXkpXG5cdFx0e1xuXHRcdFx0Y2FzZSBTVFlMRV9LRVk6XG5cdFx0XHRcdGFwcGx5U3R5bGVzKGRvbU5vZGUsIHZhbHVlKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgRVZFTlRfS0VZOlxuXHRcdFx0XHRhcHBseUV2ZW50cyhkb21Ob2RlLCBldmVudE5vZGUsIHZhbHVlKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgQVRUUl9LRVk6XG5cdFx0XHRcdGFwcGx5QXR0cnMoZG9tTm9kZSwgdmFsdWUpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBBVFRSX05TX0tFWTpcblx0XHRcdFx0YXBwbHlBdHRyc05TKGRvbU5vZGUsIHZhbHVlKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgJ3ZhbHVlJzpcblx0XHRcdFx0aWYgKGRvbU5vZGVba2V5XSAhPT0gdmFsdWUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkb21Ob2RlW2tleV0gPSB2YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0ZG9tTm9kZVtrZXldID0gdmFsdWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBhcHBseVN0eWxlcyhkb21Ob2RlLCBzdHlsZXMpXG57XG5cdHZhciBkb21Ob2RlU3R5bGUgPSBkb21Ob2RlLnN0eWxlO1xuXG5cdGZvciAodmFyIGtleSBpbiBzdHlsZXMpXG5cdHtcblx0XHRkb21Ob2RlU3R5bGVba2V5XSA9IHN0eWxlc1trZXldO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGFwcGx5RXZlbnRzKGRvbU5vZGUsIGV2ZW50Tm9kZSwgZXZlbnRzKVxue1xuXHR2YXIgYWxsSGFuZGxlcnMgPSBkb21Ob2RlLmVsbV9oYW5kbGVycyB8fCB7fTtcblxuXHRmb3IgKHZhciBrZXkgaW4gZXZlbnRzKVxuXHR7XG5cdFx0dmFyIGhhbmRsZXIgPSBhbGxIYW5kbGVyc1trZXldO1xuXHRcdHZhciB2YWx1ZSA9IGV2ZW50c1trZXldO1xuXG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpXG5cdFx0e1xuXHRcdFx0ZG9tTm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGtleSwgaGFuZGxlcik7XG5cdFx0XHRhbGxIYW5kbGVyc1trZXldID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRlbHNlIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ3VuZGVmaW5lZCcpXG5cdFx0e1xuXHRcdFx0dmFyIGhhbmRsZXIgPSBtYWtlRXZlbnRIYW5kbGVyKGV2ZW50Tm9kZSwgdmFsdWUpO1xuXHRcdFx0ZG9tTm9kZS5hZGRFdmVudExpc3RlbmVyKGtleSwgaGFuZGxlcik7XG5cdFx0XHRhbGxIYW5kbGVyc1trZXldID0gaGFuZGxlcjtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGhhbmRsZXIuaW5mbyA9IHZhbHVlO1xuXHRcdH1cblx0fVxuXG5cdGRvbU5vZGUuZWxtX2hhbmRsZXJzID0gYWxsSGFuZGxlcnM7XG59XG5cbmZ1bmN0aW9uIG1ha2VFdmVudEhhbmRsZXIoZXZlbnROb2RlLCBpbmZvKVxue1xuXHRmdW5jdGlvbiBldmVudEhhbmRsZXIoZXZlbnQpXG5cdHtcblx0XHR2YXIgaW5mbyA9IGV2ZW50SGFuZGxlci5pbmZvO1xuXG5cdFx0dmFyIHZhbHVlID0gQTIoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24ucnVuLCBpbmZvLmRlY29kZXIsIGV2ZW50KTtcblxuXHRcdGlmICh2YWx1ZS5jdG9yID09PSAnT2snKVxuXHRcdHtcblx0XHRcdHZhciBvcHRpb25zID0gaW5mby5vcHRpb25zO1xuXHRcdFx0aWYgKG9wdGlvbnMuc3RvcFByb3BhZ2F0aW9uKVxuXHRcdFx0e1xuXHRcdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdH1cblx0XHRcdGlmIChvcHRpb25zLnByZXZlbnREZWZhdWx0KVxuXHRcdFx0e1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbWVzc2FnZSA9IHZhbHVlLl8wO1xuXG5cdFx0XHR2YXIgY3VycmVudEV2ZW50Tm9kZSA9IGV2ZW50Tm9kZTtcblx0XHRcdHdoaWxlIChjdXJyZW50RXZlbnROb2RlKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgdGFnZ2VyID0gY3VycmVudEV2ZW50Tm9kZS50YWdnZXI7XG5cdFx0XHRcdGlmICh0eXBlb2YgdGFnZ2VyID09PSAnZnVuY3Rpb24nKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bWVzc2FnZSA9IHRhZ2dlcihtZXNzYWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gdGFnZ2VyLmxlbmd0aDsgaS0tOyApXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bWVzc2FnZSA9IHRhZ2dlcltpXShtZXNzYWdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Y3VycmVudEV2ZW50Tm9kZSA9IGN1cnJlbnRFdmVudE5vZGUucGFyZW50O1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRldmVudEhhbmRsZXIuaW5mbyA9IGluZm87XG5cblx0cmV0dXJuIGV2ZW50SGFuZGxlcjtcbn1cblxuZnVuY3Rpb24gYXBwbHlBdHRycyhkb21Ob2RlLCBhdHRycylcbntcblx0Zm9yICh2YXIga2V5IGluIGF0dHJzKVxuXHR7XG5cdFx0dmFyIHZhbHVlID0gYXR0cnNba2V5XTtcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJylcblx0XHR7XG5cdFx0XHRkb21Ob2RlLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0ZG9tTm9kZS5zZXRBdHRyaWJ1dGUoa2V5LCB2YWx1ZSk7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFwcGx5QXR0cnNOUyhkb21Ob2RlLCBuc0F0dHJzKVxue1xuXHRmb3IgKHZhciBrZXkgaW4gbnNBdHRycylcblx0e1xuXHRcdHZhciBwYWlyID0gbnNBdHRyc1trZXldO1xuXHRcdHZhciBuYW1lc3BhY2UgPSBwYWlyLm5hbWVzcGFjZTtcblx0XHR2YXIgdmFsdWUgPSBwYWlyLnZhbHVlO1xuXG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpXG5cdFx0e1xuXHRcdFx0ZG9tTm9kZS5yZW1vdmVBdHRyaWJ1dGVOUyhuYW1lc3BhY2UsIGtleSk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRkb21Ob2RlLnNldEF0dHJpYnV0ZU5TKG5hbWVzcGFjZSwga2V5LCB2YWx1ZSk7XG5cdFx0fVxuXHR9XG59XG5cblxuXG4vLy8vLy8vLy8vLy8gIERJRkYgIC8vLy8vLy8vLy8vL1xuXG5cbmZ1bmN0aW9uIGRpZmYoYSwgYilcbntcblx0dmFyIHBhdGNoZXMgPSBbXTtcblx0ZGlmZkhlbHAoYSwgYiwgcGF0Y2hlcywgMCk7XG5cdHJldHVybiBwYXRjaGVzO1xufVxuXG5cbmZ1bmN0aW9uIG1ha2VQYXRjaCh0eXBlLCBpbmRleCwgZGF0YSlcbntcblx0cmV0dXJuIHtcblx0XHRpbmRleDogaW5kZXgsXG5cdFx0dHlwZTogdHlwZSxcblx0XHRkYXRhOiBkYXRhLFxuXHRcdGRvbU5vZGU6IHVuZGVmaW5lZCxcblx0XHRldmVudE5vZGU6IHVuZGVmaW5lZFxuXHR9O1xufVxuXG5cbmZ1bmN0aW9uIGRpZmZIZWxwKGEsIGIsIHBhdGNoZXMsIGluZGV4KVxue1xuXHRpZiAoYSA9PT0gYilcblx0e1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHZhciBhVHlwZSA9IGEudHlwZTtcblx0dmFyIGJUeXBlID0gYi50eXBlO1xuXG5cdC8vIEJhaWwgaWYgeW91IHJ1biBpbnRvIGRpZmZlcmVudCB0eXBlcyBvZiBub2Rlcy4gSW1wbGllcyB0aGF0IHRoZVxuXHQvLyBzdHJ1Y3R1cmUgaGFzIGNoYW5nZWQgc2lnbmlmaWNhbnRseSBhbmQgaXQncyBub3Qgd29ydGggYSBkaWZmLlxuXHRpZiAoYVR5cGUgIT09IGJUeXBlKVxuXHR7XG5cdFx0cGF0Y2hlcy5wdXNoKG1ha2VQYXRjaCgncC1yZWRyYXcnLCBpbmRleCwgYikpO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIE5vdyB3ZSBrbm93IHRoYXQgYm90aCBub2RlcyBhcmUgdGhlIHNhbWUgdHlwZS5cblx0c3dpdGNoIChiVHlwZSlcblx0e1xuXHRcdGNhc2UgJ3RodW5rJzpcblx0XHRcdHZhciBhQXJncyA9IGEuYXJncztcblx0XHRcdHZhciBiQXJncyA9IGIuYXJncztcblx0XHRcdHZhciBpID0gYUFyZ3MubGVuZ3RoO1xuXHRcdFx0dmFyIHNhbWUgPSBhLmZ1bmMgPT09IGIuZnVuYyAmJiBpID09PSBiQXJncy5sZW5ndGg7XG5cdFx0XHR3aGlsZSAoc2FtZSAmJiBpLS0pXG5cdFx0XHR7XG5cdFx0XHRcdHNhbWUgPSBhQXJnc1tpXSA9PT0gYkFyZ3NbaV07XG5cdFx0XHR9XG5cdFx0XHRpZiAoc2FtZSlcblx0XHRcdHtcblx0XHRcdFx0Yi5ub2RlID0gYS5ub2RlO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRiLm5vZGUgPSBiLnRodW5rKCk7XG5cdFx0XHR2YXIgc3ViUGF0Y2hlcyA9IFtdO1xuXHRcdFx0ZGlmZkhlbHAoYS5ub2RlLCBiLm5vZGUsIHN1YlBhdGNoZXMsIDApO1xuXHRcdFx0aWYgKHN1YlBhdGNoZXMubGVuZ3RoID4gMClcblx0XHRcdHtcblx0XHRcdFx0cGF0Y2hlcy5wdXNoKG1ha2VQYXRjaCgncC10aHVuaycsIGluZGV4LCBzdWJQYXRjaGVzKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm47XG5cblx0XHRjYXNlICd0YWdnZXInOlxuXHRcdFx0Ly8gZ2F0aGVyIG5lc3RlZCB0YWdnZXJzXG5cdFx0XHR2YXIgYVRhZ2dlcnMgPSBhLnRhZ2dlcjtcblx0XHRcdHZhciBiVGFnZ2VycyA9IGIudGFnZ2VyO1xuXHRcdFx0dmFyIG5lc3RpbmcgPSBmYWxzZTtcblxuXHRcdFx0dmFyIGFTdWJOb2RlID0gYS5ub2RlO1xuXHRcdFx0d2hpbGUgKGFTdWJOb2RlLnR5cGUgPT09ICd0YWdnZXInKVxuXHRcdFx0e1xuXHRcdFx0XHRuZXN0aW5nID0gdHJ1ZTtcblxuXHRcdFx0XHR0eXBlb2YgYVRhZ2dlcnMgIT09ICdvYmplY3QnXG5cdFx0XHRcdFx0PyBhVGFnZ2VycyA9IFthVGFnZ2VycywgYVN1Yk5vZGUudGFnZ2VyXVxuXHRcdFx0XHRcdDogYVRhZ2dlcnMucHVzaChhU3ViTm9kZS50YWdnZXIpO1xuXG5cdFx0XHRcdGFTdWJOb2RlID0gYVN1Yk5vZGUubm9kZTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGJTdWJOb2RlID0gYi5ub2RlO1xuXHRcdFx0d2hpbGUgKGJTdWJOb2RlLnR5cGUgPT09ICd0YWdnZXInKVxuXHRcdFx0e1xuXHRcdFx0XHRuZXN0aW5nID0gdHJ1ZTtcblxuXHRcdFx0XHR0eXBlb2YgYlRhZ2dlcnMgIT09ICdvYmplY3QnXG5cdFx0XHRcdFx0PyBiVGFnZ2VycyA9IFtiVGFnZ2VycywgYlN1Yk5vZGUudGFnZ2VyXVxuXHRcdFx0XHRcdDogYlRhZ2dlcnMucHVzaChiU3ViTm9kZS50YWdnZXIpO1xuXG5cdFx0XHRcdGJTdWJOb2RlID0gYlN1Yk5vZGUubm9kZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSnVzdCBiYWlsIGlmIGRpZmZlcmVudCBudW1iZXJzIG9mIHRhZ2dlcnMuIFRoaXMgaW1wbGllcyB0aGVcblx0XHRcdC8vIHN0cnVjdHVyZSBvZiB0aGUgdmlydHVhbCBET00gaGFzIGNoYW5nZWQuXG5cdFx0XHRpZiAobmVzdGluZyAmJiBhVGFnZ2Vycy5sZW5ndGggIT09IGJUYWdnZXJzLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0cGF0Y2hlcy5wdXNoKG1ha2VQYXRjaCgncC1yZWRyYXcnLCBpbmRleCwgYikpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIGNoZWNrIGlmIHRhZ2dlcnMgYXJlIFwidGhlIHNhbWVcIlxuXHRcdFx0aWYgKG5lc3RpbmcgPyAhcGFpcndpc2VSZWZFcXVhbChhVGFnZ2VycywgYlRhZ2dlcnMpIDogYVRhZ2dlcnMgIT09IGJUYWdnZXJzKVxuXHRcdFx0e1xuXHRcdFx0XHRwYXRjaGVzLnB1c2gobWFrZVBhdGNoKCdwLXRhZ2dlcicsIGluZGV4LCBiVGFnZ2VycykpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBkaWZmIGV2ZXJ5dGhpbmcgYmVsb3cgdGhlIHRhZ2dlcnNcblx0XHRcdGRpZmZIZWxwKGFTdWJOb2RlLCBiU3ViTm9kZSwgcGF0Y2hlcywgaW5kZXggKyAxKTtcblx0XHRcdHJldHVybjtcblxuXHRcdGNhc2UgJ3RleHQnOlxuXHRcdFx0aWYgKGEudGV4dCAhPT0gYi50ZXh0KVxuXHRcdFx0e1xuXHRcdFx0XHRwYXRjaGVzLnB1c2gobWFrZVBhdGNoKCdwLXRleHQnLCBpbmRleCwgYi50ZXh0KSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Y2FzZSAnbm9kZSc6XG5cdFx0XHQvLyBCYWlsIGlmIG9idmlvdXMgaW5kaWNhdG9ycyBoYXZlIGNoYW5nZWQuIEltcGxpZXMgbW9yZSBzZXJpb3VzXG5cdFx0XHQvLyBzdHJ1Y3R1cmFsIGNoYW5nZXMgc3VjaCB0aGF0IGl0J3Mgbm90IHdvcnRoIGl0IHRvIGRpZmYuXG5cdFx0XHRpZiAoYS50YWcgIT09IGIudGFnIHx8IGEubmFtZXNwYWNlICE9PSBiLm5hbWVzcGFjZSlcblx0XHRcdHtcblx0XHRcdFx0cGF0Y2hlcy5wdXNoKG1ha2VQYXRjaCgncC1yZWRyYXcnLCBpbmRleCwgYikpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHZhciBmYWN0c0RpZmYgPSBkaWZmRmFjdHMoYS5mYWN0cywgYi5mYWN0cyk7XG5cblx0XHRcdGlmICh0eXBlb2YgZmFjdHNEaWZmICE9PSAndW5kZWZpbmVkJylcblx0XHRcdHtcblx0XHRcdFx0cGF0Y2hlcy5wdXNoKG1ha2VQYXRjaCgncC1mYWN0cycsIGluZGV4LCBmYWN0c0RpZmYpKTtcblx0XHRcdH1cblxuXHRcdFx0ZGlmZkNoaWxkcmVuKGEsIGIsIHBhdGNoZXMsIGluZGV4KTtcblx0XHRcdHJldHVybjtcblxuXHRcdGNhc2UgJ2tleWVkLW5vZGUnOlxuXHRcdFx0Ly8gQmFpbCBpZiBvYnZpb3VzIGluZGljYXRvcnMgaGF2ZSBjaGFuZ2VkLiBJbXBsaWVzIG1vcmUgc2VyaW91c1xuXHRcdFx0Ly8gc3RydWN0dXJhbCBjaGFuZ2VzIHN1Y2ggdGhhdCBpdCdzIG5vdCB3b3J0aCBpdCB0byBkaWZmLlxuXHRcdFx0aWYgKGEudGFnICE9PSBiLnRhZyB8fCBhLm5hbWVzcGFjZSAhPT0gYi5uYW1lc3BhY2UpXG5cdFx0XHR7XG5cdFx0XHRcdHBhdGNoZXMucHVzaChtYWtlUGF0Y2goJ3AtcmVkcmF3JywgaW5kZXgsIGIpKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgZmFjdHNEaWZmID0gZGlmZkZhY3RzKGEuZmFjdHMsIGIuZmFjdHMpO1xuXG5cdFx0XHRpZiAodHlwZW9mIGZhY3RzRGlmZiAhPT0gJ3VuZGVmaW5lZCcpXG5cdFx0XHR7XG5cdFx0XHRcdHBhdGNoZXMucHVzaChtYWtlUGF0Y2goJ3AtZmFjdHMnLCBpbmRleCwgZmFjdHNEaWZmKSk7XG5cdFx0XHR9XG5cblx0XHRcdGRpZmZLZXllZENoaWxkcmVuKGEsIGIsIHBhdGNoZXMsIGluZGV4KTtcblx0XHRcdHJldHVybjtcblxuXHRcdGNhc2UgJ2N1c3RvbSc6XG5cdFx0XHRpZiAoYS5pbXBsICE9PSBiLmltcGwpXG5cdFx0XHR7XG5cdFx0XHRcdHBhdGNoZXMucHVzaChtYWtlUGF0Y2goJ3AtcmVkcmF3JywgaW5kZXgsIGIpKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgZmFjdHNEaWZmID0gZGlmZkZhY3RzKGEuZmFjdHMsIGIuZmFjdHMpO1xuXHRcdFx0aWYgKHR5cGVvZiBmYWN0c0RpZmYgIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0e1xuXHRcdFx0XHRwYXRjaGVzLnB1c2gobWFrZVBhdGNoKCdwLWZhY3RzJywgaW5kZXgsIGZhY3RzRGlmZikpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcGF0Y2ggPSBiLmltcGwuZGlmZihhLGIpO1xuXHRcdFx0aWYgKHBhdGNoKVxuXHRcdFx0e1xuXHRcdFx0XHRwYXRjaGVzLnB1c2gobWFrZVBhdGNoKCdwLWN1c3RvbScsIGluZGV4LCBwYXRjaCkpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0fVxufVxuXG5cbi8vIGFzc3VtZXMgdGhlIGluY29taW5nIGFycmF5cyBhcmUgdGhlIHNhbWUgbGVuZ3RoXG5mdW5jdGlvbiBwYWlyd2lzZVJlZkVxdWFsKGFzLCBicylcbntcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcy5sZW5ndGg7IGkrKylcblx0e1xuXHRcdGlmIChhc1tpXSAhPT0gYnNbaV0pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0cnVlO1xufVxuXG5cbi8vIFRPRE8gSW5zdGVhZCBvZiBjcmVhdGluZyBhIG5ldyBkaWZmIG9iamVjdCwgaXQncyBwb3NzaWJsZSB0byBqdXN0IHRlc3QgaWZcbi8vIHRoZXJlICppcyogYSBkaWZmLiBEdXJpbmcgdGhlIGFjdHVhbCBwYXRjaCwgZG8gdGhlIGRpZmYgYWdhaW4gYW5kIG1ha2UgdGhlXG4vLyBtb2RpZmljYXRpb25zIGRpcmVjdGx5LiBUaGlzIHdheSwgdGhlcmUncyBubyBuZXcgYWxsb2NhdGlvbnMuIFdvcnRoIGl0P1xuZnVuY3Rpb24gZGlmZkZhY3RzKGEsIGIsIGNhdGVnb3J5KVxue1xuXHR2YXIgZGlmZjtcblxuXHQvLyBsb29rIGZvciBjaGFuZ2VzIGFuZCByZW1vdmFsc1xuXHRmb3IgKHZhciBhS2V5IGluIGEpXG5cdHtcblx0XHRpZiAoYUtleSA9PT0gU1RZTEVfS0VZIHx8IGFLZXkgPT09IEVWRU5UX0tFWSB8fCBhS2V5ID09PSBBVFRSX0tFWSB8fCBhS2V5ID09PSBBVFRSX05TX0tFWSlcblx0XHR7XG5cdFx0XHR2YXIgc3ViRGlmZiA9IGRpZmZGYWN0cyhhW2FLZXldLCBiW2FLZXldIHx8IHt9LCBhS2V5KTtcblx0XHRcdGlmIChzdWJEaWZmKVxuXHRcdFx0e1xuXHRcdFx0XHRkaWZmID0gZGlmZiB8fCB7fTtcblx0XHRcdFx0ZGlmZlthS2V5XSA9IHN1YkRpZmY7XG5cdFx0XHR9XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHQvLyByZW1vdmUgaWYgbm90IGluIHRoZSBuZXcgZmFjdHNcblx0XHRpZiAoIShhS2V5IGluIGIpKVxuXHRcdHtcblx0XHRcdGRpZmYgPSBkaWZmIHx8IHt9O1xuXHRcdFx0ZGlmZlthS2V5XSA9XG5cdFx0XHRcdCh0eXBlb2YgY2F0ZWdvcnkgPT09ICd1bmRlZmluZWQnKVxuXHRcdFx0XHRcdD8gKHR5cGVvZiBhW2FLZXldID09PSAnc3RyaW5nJyA/ICcnIDogbnVsbClcblx0XHRcdFx0XHQ6XG5cdFx0XHRcdChjYXRlZ29yeSA9PT0gU1RZTEVfS0VZKVxuXHRcdFx0XHRcdD8gJydcblx0XHRcdFx0XHQ6XG5cdFx0XHRcdChjYXRlZ29yeSA9PT0gRVZFTlRfS0VZIHx8IGNhdGVnb3J5ID09PSBBVFRSX0tFWSlcblx0XHRcdFx0XHQ/IHVuZGVmaW5lZFxuXHRcdFx0XHRcdDpcblx0XHRcdFx0eyBuYW1lc3BhY2U6IGFbYUtleV0ubmFtZXNwYWNlLCB2YWx1ZTogdW5kZWZpbmVkIH07XG5cblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdHZhciBhVmFsdWUgPSBhW2FLZXldO1xuXHRcdHZhciBiVmFsdWUgPSBiW2FLZXldO1xuXG5cdFx0Ly8gcmVmZXJlbmNlIGVxdWFsLCBzbyBkb24ndCB3b3JyeSBhYm91dCBpdFxuXHRcdGlmIChhVmFsdWUgPT09IGJWYWx1ZSAmJiBhS2V5ICE9PSAndmFsdWUnXG5cdFx0XHR8fCBjYXRlZ29yeSA9PT0gRVZFTlRfS0VZICYmIGVxdWFsRXZlbnRzKGFWYWx1ZSwgYlZhbHVlKSlcblx0XHR7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRkaWZmID0gZGlmZiB8fCB7fTtcblx0XHRkaWZmW2FLZXldID0gYlZhbHVlO1xuXHR9XG5cblx0Ly8gYWRkIG5ldyBzdHVmZlxuXHRmb3IgKHZhciBiS2V5IGluIGIpXG5cdHtcblx0XHRpZiAoIShiS2V5IGluIGEpKVxuXHRcdHtcblx0XHRcdGRpZmYgPSBkaWZmIHx8IHt9O1xuXHRcdFx0ZGlmZltiS2V5XSA9IGJbYktleV07XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGRpZmY7XG59XG5cblxuZnVuY3Rpb24gZGlmZkNoaWxkcmVuKGFQYXJlbnQsIGJQYXJlbnQsIHBhdGNoZXMsIHJvb3RJbmRleClcbntcblx0dmFyIGFDaGlsZHJlbiA9IGFQYXJlbnQuY2hpbGRyZW47XG5cdHZhciBiQ2hpbGRyZW4gPSBiUGFyZW50LmNoaWxkcmVuO1xuXG5cdHZhciBhTGVuID0gYUNoaWxkcmVuLmxlbmd0aDtcblx0dmFyIGJMZW4gPSBiQ2hpbGRyZW4ubGVuZ3RoO1xuXG5cdC8vIEZJR1VSRSBPVVQgSUYgVEhFUkUgQVJFIElOU0VSVFMgT1IgUkVNT1ZBTFNcblxuXHRpZiAoYUxlbiA+IGJMZW4pXG5cdHtcblx0XHRwYXRjaGVzLnB1c2gobWFrZVBhdGNoKCdwLXJlbW92ZS1sYXN0Jywgcm9vdEluZGV4LCBhTGVuIC0gYkxlbikpO1xuXHR9XG5cdGVsc2UgaWYgKGFMZW4gPCBiTGVuKVxuXHR7XG5cdFx0cGF0Y2hlcy5wdXNoKG1ha2VQYXRjaCgncC1hcHBlbmQnLCByb290SW5kZXgsIGJDaGlsZHJlbi5zbGljZShhTGVuKSkpO1xuXHR9XG5cblx0Ly8gUEFJUldJU0UgRElGRiBFVkVSWVRISU5HIEVMU0VcblxuXHR2YXIgaW5kZXggPSByb290SW5kZXg7XG5cdHZhciBtaW5MZW4gPSBhTGVuIDwgYkxlbiA/IGFMZW4gOiBiTGVuO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IG1pbkxlbjsgaSsrKVxuXHR7XG5cdFx0aW5kZXgrKztcblx0XHR2YXIgYUNoaWxkID0gYUNoaWxkcmVuW2ldO1xuXHRcdGRpZmZIZWxwKGFDaGlsZCwgYkNoaWxkcmVuW2ldLCBwYXRjaGVzLCBpbmRleCk7XG5cdFx0aW5kZXggKz0gYUNoaWxkLmRlc2NlbmRhbnRzQ291bnQgfHwgMDtcblx0fVxufVxuXG5cblxuLy8vLy8vLy8vLy8vICBLRVlFRCBESUZGICAvLy8vLy8vLy8vLy9cblxuXG5mdW5jdGlvbiBkaWZmS2V5ZWRDaGlsZHJlbihhUGFyZW50LCBiUGFyZW50LCBwYXRjaGVzLCByb290SW5kZXgpXG57XG5cdHZhciBsb2NhbFBhdGNoZXMgPSBbXTtcblxuXHR2YXIgY2hhbmdlcyA9IHt9OyAvLyBEaWN0IFN0cmluZyBFbnRyeVxuXHR2YXIgaW5zZXJ0cyA9IFtdOyAvLyBBcnJheSB7IGluZGV4IDogSW50LCBlbnRyeSA6IEVudHJ5IH1cblx0Ly8gdHlwZSBFbnRyeSA9IHsgdGFnIDogU3RyaW5nLCB2bm9kZSA6IFZOb2RlLCBpbmRleCA6IEludCwgZGF0YSA6IF8gfVxuXG5cdHZhciBhQ2hpbGRyZW4gPSBhUGFyZW50LmNoaWxkcmVuO1xuXHR2YXIgYkNoaWxkcmVuID0gYlBhcmVudC5jaGlsZHJlbjtcblx0dmFyIGFMZW4gPSBhQ2hpbGRyZW4ubGVuZ3RoO1xuXHR2YXIgYkxlbiA9IGJDaGlsZHJlbi5sZW5ndGg7XG5cdHZhciBhSW5kZXggPSAwO1xuXHR2YXIgYkluZGV4ID0gMDtcblxuXHR2YXIgaW5kZXggPSByb290SW5kZXg7XG5cblx0d2hpbGUgKGFJbmRleCA8IGFMZW4gJiYgYkluZGV4IDwgYkxlbilcblx0e1xuXHRcdHZhciBhID0gYUNoaWxkcmVuW2FJbmRleF07XG5cdFx0dmFyIGIgPSBiQ2hpbGRyZW5bYkluZGV4XTtcblxuXHRcdHZhciBhS2V5ID0gYS5fMDtcblx0XHR2YXIgYktleSA9IGIuXzA7XG5cdFx0dmFyIGFOb2RlID0gYS5fMTtcblx0XHR2YXIgYk5vZGUgPSBiLl8xO1xuXG5cdFx0Ly8gY2hlY2sgaWYga2V5cyBtYXRjaFxuXG5cdFx0aWYgKGFLZXkgPT09IGJLZXkpXG5cdFx0e1xuXHRcdFx0aW5kZXgrKztcblx0XHRcdGRpZmZIZWxwKGFOb2RlLCBiTm9kZSwgbG9jYWxQYXRjaGVzLCBpbmRleCk7XG5cdFx0XHRpbmRleCArPSBhTm9kZS5kZXNjZW5kYW50c0NvdW50IHx8IDA7XG5cblx0XHRcdGFJbmRleCsrO1xuXHRcdFx0YkluZGV4Kys7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHQvLyBsb29rIGFoZWFkIDEgdG8gZGV0ZWN0IGluc2VydGlvbnMgYW5kIHJlbW92YWxzLlxuXG5cdFx0dmFyIGFMb29rQWhlYWQgPSBhSW5kZXggKyAxIDwgYUxlbjtcblx0XHR2YXIgYkxvb2tBaGVhZCA9IGJJbmRleCArIDEgPCBiTGVuO1xuXG5cdFx0aWYgKGFMb29rQWhlYWQpXG5cdFx0e1xuXHRcdFx0dmFyIGFOZXh0ID0gYUNoaWxkcmVuW2FJbmRleCArIDFdO1xuXHRcdFx0dmFyIGFOZXh0S2V5ID0gYU5leHQuXzA7XG5cdFx0XHR2YXIgYU5leHROb2RlID0gYU5leHQuXzE7XG5cdFx0XHR2YXIgb2xkTWF0Y2ggPSBiS2V5ID09PSBhTmV4dEtleTtcblx0XHR9XG5cblx0XHRpZiAoYkxvb2tBaGVhZClcblx0XHR7XG5cdFx0XHR2YXIgYk5leHQgPSBiQ2hpbGRyZW5bYkluZGV4ICsgMV07XG5cdFx0XHR2YXIgYk5leHRLZXkgPSBiTmV4dC5fMDtcblx0XHRcdHZhciBiTmV4dE5vZGUgPSBiTmV4dC5fMTtcblx0XHRcdHZhciBuZXdNYXRjaCA9IGFLZXkgPT09IGJOZXh0S2V5O1xuXHRcdH1cblxuXG5cdFx0Ly8gc3dhcCBhIGFuZCBiXG5cdFx0aWYgKGFMb29rQWhlYWQgJiYgYkxvb2tBaGVhZCAmJiBuZXdNYXRjaCAmJiBvbGRNYXRjaClcblx0XHR7XG5cdFx0XHRpbmRleCsrO1xuXHRcdFx0ZGlmZkhlbHAoYU5vZGUsIGJOZXh0Tm9kZSwgbG9jYWxQYXRjaGVzLCBpbmRleCk7XG5cdFx0XHRpbnNlcnROb2RlKGNoYW5nZXMsIGxvY2FsUGF0Y2hlcywgYUtleSwgYk5vZGUsIGJJbmRleCwgaW5zZXJ0cyk7XG5cdFx0XHRpbmRleCArPSBhTm9kZS5kZXNjZW5kYW50c0NvdW50IHx8IDA7XG5cblx0XHRcdGluZGV4Kys7XG5cdFx0XHRyZW1vdmVOb2RlKGNoYW5nZXMsIGxvY2FsUGF0Y2hlcywgYUtleSwgYU5leHROb2RlLCBpbmRleCk7XG5cdFx0XHRpbmRleCArPSBhTmV4dE5vZGUuZGVzY2VuZGFudHNDb3VudCB8fCAwO1xuXG5cdFx0XHRhSW5kZXggKz0gMjtcblx0XHRcdGJJbmRleCArPSAyO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0Ly8gaW5zZXJ0IGJcblx0XHRpZiAoYkxvb2tBaGVhZCAmJiBuZXdNYXRjaClcblx0XHR7XG5cdFx0XHRpbmRleCsrO1xuXHRcdFx0aW5zZXJ0Tm9kZShjaGFuZ2VzLCBsb2NhbFBhdGNoZXMsIGJLZXksIGJOb2RlLCBiSW5kZXgsIGluc2VydHMpO1xuXHRcdFx0ZGlmZkhlbHAoYU5vZGUsIGJOZXh0Tm9kZSwgbG9jYWxQYXRjaGVzLCBpbmRleCk7XG5cdFx0XHRpbmRleCArPSBhTm9kZS5kZXNjZW5kYW50c0NvdW50IHx8IDA7XG5cblx0XHRcdGFJbmRleCArPSAxO1xuXHRcdFx0YkluZGV4ICs9IDI7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHQvLyByZW1vdmUgYVxuXHRcdGlmIChhTG9va0FoZWFkICYmIG9sZE1hdGNoKVxuXHRcdHtcblx0XHRcdGluZGV4Kys7XG5cdFx0XHRyZW1vdmVOb2RlKGNoYW5nZXMsIGxvY2FsUGF0Y2hlcywgYUtleSwgYU5vZGUsIGluZGV4KTtcblx0XHRcdGluZGV4ICs9IGFOb2RlLmRlc2NlbmRhbnRzQ291bnQgfHwgMDtcblxuXHRcdFx0aW5kZXgrKztcblx0XHRcdGRpZmZIZWxwKGFOZXh0Tm9kZSwgYk5vZGUsIGxvY2FsUGF0Y2hlcywgaW5kZXgpO1xuXHRcdFx0aW5kZXggKz0gYU5leHROb2RlLmRlc2NlbmRhbnRzQ291bnQgfHwgMDtcblxuXHRcdFx0YUluZGV4ICs9IDI7XG5cdFx0XHRiSW5kZXggKz0gMTtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdC8vIHJlbW92ZSBhLCBpbnNlcnQgYlxuXHRcdGlmIChhTG9va0FoZWFkICYmIGJMb29rQWhlYWQgJiYgYU5leHRLZXkgPT09IGJOZXh0S2V5KVxuXHRcdHtcblx0XHRcdGluZGV4Kys7XG5cdFx0XHRyZW1vdmVOb2RlKGNoYW5nZXMsIGxvY2FsUGF0Y2hlcywgYUtleSwgYU5vZGUsIGluZGV4KTtcblx0XHRcdGluc2VydE5vZGUoY2hhbmdlcywgbG9jYWxQYXRjaGVzLCBiS2V5LCBiTm9kZSwgYkluZGV4LCBpbnNlcnRzKTtcblx0XHRcdGluZGV4ICs9IGFOb2RlLmRlc2NlbmRhbnRzQ291bnQgfHwgMDtcblxuXHRcdFx0aW5kZXgrKztcblx0XHRcdGRpZmZIZWxwKGFOZXh0Tm9kZSwgYk5leHROb2RlLCBsb2NhbFBhdGNoZXMsIGluZGV4KTtcblx0XHRcdGluZGV4ICs9IGFOZXh0Tm9kZS5kZXNjZW5kYW50c0NvdW50IHx8IDA7XG5cblx0XHRcdGFJbmRleCArPSAyO1xuXHRcdFx0YkluZGV4ICs9IDI7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRicmVhaztcblx0fVxuXG5cdC8vIGVhdCB1cCBhbnkgcmVtYWluaW5nIG5vZGVzIHdpdGggcmVtb3ZlTm9kZSBhbmQgaW5zZXJ0Tm9kZVxuXG5cdHdoaWxlIChhSW5kZXggPCBhTGVuKVxuXHR7XG5cdFx0aW5kZXgrKztcblx0XHR2YXIgYSA9IGFDaGlsZHJlblthSW5kZXhdO1xuXHRcdHZhciBhTm9kZSA9IGEuXzE7XG5cdFx0cmVtb3ZlTm9kZShjaGFuZ2VzLCBsb2NhbFBhdGNoZXMsIGEuXzAsIGFOb2RlLCBpbmRleCk7XG5cdFx0aW5kZXggKz0gYU5vZGUuZGVzY2VuZGFudHNDb3VudCB8fCAwO1xuXHRcdGFJbmRleCsrO1xuXHR9XG5cblx0dmFyIGVuZEluc2VydHM7XG5cdHdoaWxlIChiSW5kZXggPCBiTGVuKVxuXHR7XG5cdFx0ZW5kSW5zZXJ0cyA9IGVuZEluc2VydHMgfHwgW107XG5cdFx0dmFyIGIgPSBiQ2hpbGRyZW5bYkluZGV4XTtcblx0XHRpbnNlcnROb2RlKGNoYW5nZXMsIGxvY2FsUGF0Y2hlcywgYi5fMCwgYi5fMSwgdW5kZWZpbmVkLCBlbmRJbnNlcnRzKTtcblx0XHRiSW5kZXgrKztcblx0fVxuXG5cdGlmIChsb2NhbFBhdGNoZXMubGVuZ3RoID4gMCB8fCBpbnNlcnRzLmxlbmd0aCA+IDAgfHwgdHlwZW9mIGVuZEluc2VydHMgIT09ICd1bmRlZmluZWQnKVxuXHR7XG5cdFx0cGF0Y2hlcy5wdXNoKG1ha2VQYXRjaCgncC1yZW9yZGVyJywgcm9vdEluZGV4LCB7XG5cdFx0XHRwYXRjaGVzOiBsb2NhbFBhdGNoZXMsXG5cdFx0XHRpbnNlcnRzOiBpbnNlcnRzLFxuXHRcdFx0ZW5kSW5zZXJ0czogZW5kSW5zZXJ0c1xuXHRcdH0pKTtcblx0fVxufVxuXG5cblxuLy8vLy8vLy8vLy8vICBDSEFOR0VTIEZST00gS0VZRUQgRElGRiAgLy8vLy8vLy8vLy8vXG5cblxudmFyIFBPU1RGSVggPSAnX2VsbVc2QkwnO1xuXG5cbmZ1bmN0aW9uIGluc2VydE5vZGUoY2hhbmdlcywgbG9jYWxQYXRjaGVzLCBrZXksIHZub2RlLCBiSW5kZXgsIGluc2VydHMpXG57XG5cdHZhciBlbnRyeSA9IGNoYW5nZXNba2V5XTtcblxuXHQvLyBuZXZlciBzZWVuIHRoaXMga2V5IGJlZm9yZVxuXHRpZiAodHlwZW9mIGVudHJ5ID09PSAndW5kZWZpbmVkJylcblx0e1xuXHRcdGVudHJ5ID0ge1xuXHRcdFx0dGFnOiAnaW5zZXJ0Jyxcblx0XHRcdHZub2RlOiB2bm9kZSxcblx0XHRcdGluZGV4OiBiSW5kZXgsXG5cdFx0XHRkYXRhOiB1bmRlZmluZWRcblx0XHR9O1xuXG5cdFx0aW5zZXJ0cy5wdXNoKHsgaW5kZXg6IGJJbmRleCwgZW50cnk6IGVudHJ5IH0pO1xuXHRcdGNoYW5nZXNba2V5XSA9IGVudHJ5O1xuXG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gdGhpcyBrZXkgd2FzIHJlbW92ZWQgZWFybGllciwgYSBtYXRjaCFcblx0aWYgKGVudHJ5LnRhZyA9PT0gJ3JlbW92ZScpXG5cdHtcblx0XHRpbnNlcnRzLnB1c2goeyBpbmRleDogYkluZGV4LCBlbnRyeTogZW50cnkgfSk7XG5cblx0XHRlbnRyeS50YWcgPSAnbW92ZSc7XG5cdFx0dmFyIHN1YlBhdGNoZXMgPSBbXTtcblx0XHRkaWZmSGVscChlbnRyeS52bm9kZSwgdm5vZGUsIHN1YlBhdGNoZXMsIGVudHJ5LmluZGV4KTtcblx0XHRlbnRyeS5pbmRleCA9IGJJbmRleDtcblx0XHRlbnRyeS5kYXRhLmRhdGEgPSB7XG5cdFx0XHRwYXRjaGVzOiBzdWJQYXRjaGVzLFxuXHRcdFx0ZW50cnk6IGVudHJ5XG5cdFx0fTtcblxuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIHRoaXMga2V5IGhhcyBhbHJlYWR5IGJlZW4gaW5zZXJ0ZWQgb3IgbW92ZWQsIGEgZHVwbGljYXRlIVxuXHRpbnNlcnROb2RlKGNoYW5nZXMsIGxvY2FsUGF0Y2hlcywga2V5ICsgUE9TVEZJWCwgdm5vZGUsIGJJbmRleCwgaW5zZXJ0cyk7XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTm9kZShjaGFuZ2VzLCBsb2NhbFBhdGNoZXMsIGtleSwgdm5vZGUsIGluZGV4KVxue1xuXHR2YXIgZW50cnkgPSBjaGFuZ2VzW2tleV07XG5cblx0Ly8gbmV2ZXIgc2VlbiB0aGlzIGtleSBiZWZvcmVcblx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gJ3VuZGVmaW5lZCcpXG5cdHtcblx0XHR2YXIgcGF0Y2ggPSBtYWtlUGF0Y2goJ3AtcmVtb3ZlJywgaW5kZXgsIHVuZGVmaW5lZCk7XG5cdFx0bG9jYWxQYXRjaGVzLnB1c2gocGF0Y2gpO1xuXG5cdFx0Y2hhbmdlc1trZXldID0ge1xuXHRcdFx0dGFnOiAncmVtb3ZlJyxcblx0XHRcdHZub2RlOiB2bm9kZSxcblx0XHRcdGluZGV4OiBpbmRleCxcblx0XHRcdGRhdGE6IHBhdGNoXG5cdFx0fTtcblxuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIHRoaXMga2V5IHdhcyBpbnNlcnRlZCBlYXJsaWVyLCBhIG1hdGNoIVxuXHRpZiAoZW50cnkudGFnID09PSAnaW5zZXJ0Jylcblx0e1xuXHRcdGVudHJ5LnRhZyA9ICdtb3ZlJztcblx0XHR2YXIgc3ViUGF0Y2hlcyA9IFtdO1xuXHRcdGRpZmZIZWxwKHZub2RlLCBlbnRyeS52bm9kZSwgc3ViUGF0Y2hlcywgaW5kZXgpO1xuXG5cdFx0dmFyIHBhdGNoID0gbWFrZVBhdGNoKCdwLXJlbW92ZScsIGluZGV4LCB7XG5cdFx0XHRwYXRjaGVzOiBzdWJQYXRjaGVzLFxuXHRcdFx0ZW50cnk6IGVudHJ5XG5cdFx0fSk7XG5cdFx0bG9jYWxQYXRjaGVzLnB1c2gocGF0Y2gpO1xuXG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gdGhpcyBrZXkgaGFzIGFscmVhZHkgYmVlbiByZW1vdmVkIG9yIG1vdmVkLCBhIGR1cGxpY2F0ZSFcblx0cmVtb3ZlTm9kZShjaGFuZ2VzLCBsb2NhbFBhdGNoZXMsIGtleSArIFBPU1RGSVgsIHZub2RlLCBpbmRleCk7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8gIEFERCBET00gTk9ERVMgIC8vLy8vLy8vLy8vL1xuLy9cbi8vIEVhY2ggRE9NIG5vZGUgaGFzIGFuIFwiaW5kZXhcIiBhc3NpZ25lZCBpbiBvcmRlciBvZiB0cmF2ZXJzYWwuIEl0IGlzIGltcG9ydGFudFxuLy8gdG8gbWluaW1pemUgb3VyIGNyYXdsIG92ZXIgdGhlIGFjdHVhbCBET00sIHNvIHRoZXNlIGluZGV4ZXMgKGFsb25nIHdpdGggdGhlXG4vLyBkZXNjZW5kYW50c0NvdW50IG9mIHZpcnR1YWwgbm9kZXMpIGxldCB1cyBza2lwIHRvdWNoaW5nIGVudGlyZSBzdWJ0cmVlcyBvZlxuLy8gdGhlIERPTSBpZiB3ZSBrbm93IHRoZXJlIGFyZSBubyBwYXRjaGVzIHRoZXJlLlxuXG5cbmZ1bmN0aW9uIGFkZERvbU5vZGVzKGRvbU5vZGUsIHZOb2RlLCBwYXRjaGVzLCBldmVudE5vZGUpXG57XG5cdGFkZERvbU5vZGVzSGVscChkb21Ob2RlLCB2Tm9kZSwgcGF0Y2hlcywgMCwgMCwgdk5vZGUuZGVzY2VuZGFudHNDb3VudCwgZXZlbnROb2RlKTtcbn1cblxuXG4vLyBhc3N1bWVzIGBwYXRjaGVzYCBpcyBub24tZW1wdHkgYW5kIGluZGV4ZXMgaW5jcmVhc2UgbW9ub3RvbmljYWxseS5cbmZ1bmN0aW9uIGFkZERvbU5vZGVzSGVscChkb21Ob2RlLCB2Tm9kZSwgcGF0Y2hlcywgaSwgbG93LCBoaWdoLCBldmVudE5vZGUpXG57XG5cdHZhciBwYXRjaCA9IHBhdGNoZXNbaV07XG5cdHZhciBpbmRleCA9IHBhdGNoLmluZGV4O1xuXG5cdHdoaWxlIChpbmRleCA9PT0gbG93KVxuXHR7XG5cdFx0dmFyIHBhdGNoVHlwZSA9IHBhdGNoLnR5cGU7XG5cblx0XHRpZiAocGF0Y2hUeXBlID09PSAncC10aHVuaycpXG5cdFx0e1xuXHRcdFx0YWRkRG9tTm9kZXMoZG9tTm9kZSwgdk5vZGUubm9kZSwgcGF0Y2guZGF0YSwgZXZlbnROb2RlKTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAocGF0Y2hUeXBlID09PSAncC1yZW9yZGVyJylcblx0XHR7XG5cdFx0XHRwYXRjaC5kb21Ob2RlID0gZG9tTm9kZTtcblx0XHRcdHBhdGNoLmV2ZW50Tm9kZSA9IGV2ZW50Tm9kZTtcblxuXHRcdFx0dmFyIHN1YlBhdGNoZXMgPSBwYXRjaC5kYXRhLnBhdGNoZXM7XG5cdFx0XHRpZiAoc3ViUGF0Y2hlcy5sZW5ndGggPiAwKVxuXHRcdFx0e1xuXHRcdFx0XHRhZGREb21Ob2Rlc0hlbHAoZG9tTm9kZSwgdk5vZGUsIHN1YlBhdGNoZXMsIDAsIGxvdywgaGlnaCwgZXZlbnROb2RlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAocGF0Y2hUeXBlID09PSAncC1yZW1vdmUnKVxuXHRcdHtcblx0XHRcdHBhdGNoLmRvbU5vZGUgPSBkb21Ob2RlO1xuXHRcdFx0cGF0Y2guZXZlbnROb2RlID0gZXZlbnROb2RlO1xuXG5cdFx0XHR2YXIgZGF0YSA9IHBhdGNoLmRhdGE7XG5cdFx0XHRpZiAodHlwZW9mIGRhdGEgIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0e1xuXHRcdFx0XHRkYXRhLmVudHJ5LmRhdGEgPSBkb21Ob2RlO1xuXHRcdFx0XHR2YXIgc3ViUGF0Y2hlcyA9IGRhdGEucGF0Y2hlcztcblx0XHRcdFx0aWYgKHN1YlBhdGNoZXMubGVuZ3RoID4gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFkZERvbU5vZGVzSGVscChkb21Ob2RlLCB2Tm9kZSwgc3ViUGF0Y2hlcywgMCwgbG93LCBoaWdoLCBldmVudE5vZGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRwYXRjaC5kb21Ob2RlID0gZG9tTm9kZTtcblx0XHRcdHBhdGNoLmV2ZW50Tm9kZSA9IGV2ZW50Tm9kZTtcblx0XHR9XG5cblx0XHRpKys7XG5cblx0XHRpZiAoIShwYXRjaCA9IHBhdGNoZXNbaV0pIHx8IChpbmRleCA9IHBhdGNoLmluZGV4KSA+IGhpZ2gpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGk7XG5cdFx0fVxuXHR9XG5cblx0c3dpdGNoICh2Tm9kZS50eXBlKVxuXHR7XG5cdFx0Y2FzZSAndGFnZ2VyJzpcblx0XHRcdHZhciBzdWJOb2RlID0gdk5vZGUubm9kZTtcblxuXHRcdFx0d2hpbGUgKHN1Yk5vZGUudHlwZSA9PT0gXCJ0YWdnZXJcIilcblx0XHRcdHtcblx0XHRcdFx0c3ViTm9kZSA9IHN1Yk5vZGUubm9kZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGFkZERvbU5vZGVzSGVscChkb21Ob2RlLCBzdWJOb2RlLCBwYXRjaGVzLCBpLCBsb3cgKyAxLCBoaWdoLCBkb21Ob2RlLmVsbV9ldmVudF9ub2RlX3JlZik7XG5cblx0XHRjYXNlICdub2RlJzpcblx0XHRcdHZhciB2Q2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlbjtcblx0XHRcdHZhciBjaGlsZE5vZGVzID0gZG9tTm9kZS5jaGlsZE5vZGVzO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB2Q2hpbGRyZW4ubGVuZ3RoOyBqKyspXG5cdFx0XHR7XG5cdFx0XHRcdGxvdysrO1xuXHRcdFx0XHR2YXIgdkNoaWxkID0gdkNoaWxkcmVuW2pdO1xuXHRcdFx0XHR2YXIgbmV4dExvdyA9IGxvdyArICh2Q2hpbGQuZGVzY2VuZGFudHNDb3VudCB8fCAwKTtcblx0XHRcdFx0aWYgKGxvdyA8PSBpbmRleCAmJiBpbmRleCA8PSBuZXh0TG93KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aSA9IGFkZERvbU5vZGVzSGVscChjaGlsZE5vZGVzW2pdLCB2Q2hpbGQsIHBhdGNoZXMsIGksIGxvdywgbmV4dExvdywgZXZlbnROb2RlKTtcblx0XHRcdFx0XHRpZiAoIShwYXRjaCA9IHBhdGNoZXNbaV0pIHx8IChpbmRleCA9IHBhdGNoLmluZGV4KSA+IGhpZ2gpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGxvdyA9IG5leHRMb3c7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gaTtcblxuXHRcdGNhc2UgJ2tleWVkLW5vZGUnOlxuXHRcdFx0dmFyIHZDaGlsZHJlbiA9IHZOb2RlLmNoaWxkcmVuO1xuXHRcdFx0dmFyIGNoaWxkTm9kZXMgPSBkb21Ob2RlLmNoaWxkTm9kZXM7XG5cdFx0XHRmb3IgKHZhciBqID0gMDsgaiA8IHZDaGlsZHJlbi5sZW5ndGg7IGorKylcblx0XHRcdHtcblx0XHRcdFx0bG93Kys7XG5cdFx0XHRcdHZhciB2Q2hpbGQgPSB2Q2hpbGRyZW5bal0uXzE7XG5cdFx0XHRcdHZhciBuZXh0TG93ID0gbG93ICsgKHZDaGlsZC5kZXNjZW5kYW50c0NvdW50IHx8IDApO1xuXHRcdFx0XHRpZiAobG93IDw9IGluZGV4ICYmIGluZGV4IDw9IG5leHRMb3cpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpID0gYWRkRG9tTm9kZXNIZWxwKGNoaWxkTm9kZXNbal0sIHZDaGlsZCwgcGF0Y2hlcywgaSwgbG93LCBuZXh0TG93LCBldmVudE5vZGUpO1xuXHRcdFx0XHRcdGlmICghKHBhdGNoID0gcGF0Y2hlc1tpXSkgfHwgKGluZGV4ID0gcGF0Y2guaW5kZXgpID4gaGlnaClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gaTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0bG93ID0gbmV4dExvdztcblx0XHRcdH1cblx0XHRcdHJldHVybiBpO1xuXG5cdFx0Y2FzZSAndGV4dCc6XG5cdFx0Y2FzZSAndGh1bmsnOlxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdzaG91bGQgbmV2ZXIgdHJhdmVyc2UgYHRleHRgIG9yIGB0aHVua2Agbm9kZXMgbGlrZSB0aGlzJyk7XG5cdH1cbn1cblxuXG5cbi8vLy8vLy8vLy8vLyAgQVBQTFkgUEFUQ0hFUyAgLy8vLy8vLy8vLy8vXG5cblxuZnVuY3Rpb24gYXBwbHlQYXRjaGVzKHJvb3REb21Ob2RlLCBvbGRWaXJ0dWFsTm9kZSwgcGF0Y2hlcywgZXZlbnROb2RlKVxue1xuXHRpZiAocGF0Y2hlcy5sZW5ndGggPT09IDApXG5cdHtcblx0XHRyZXR1cm4gcm9vdERvbU5vZGU7XG5cdH1cblxuXHRhZGREb21Ob2Rlcyhyb290RG9tTm9kZSwgb2xkVmlydHVhbE5vZGUsIHBhdGNoZXMsIGV2ZW50Tm9kZSk7XG5cdHJldHVybiBhcHBseVBhdGNoZXNIZWxwKHJvb3REb21Ob2RlLCBwYXRjaGVzKTtcbn1cblxuZnVuY3Rpb24gYXBwbHlQYXRjaGVzSGVscChyb290RG9tTm9kZSwgcGF0Y2hlcylcbntcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwYXRjaGVzLmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0dmFyIHBhdGNoID0gcGF0Y2hlc1tpXTtcblx0XHR2YXIgbG9jYWxEb21Ob2RlID0gcGF0Y2guZG9tTm9kZVxuXHRcdHZhciBuZXdOb2RlID0gYXBwbHlQYXRjaChsb2NhbERvbU5vZGUsIHBhdGNoKTtcblx0XHRpZiAobG9jYWxEb21Ob2RlID09PSByb290RG9tTm9kZSlcblx0XHR7XG5cdFx0XHRyb290RG9tTm9kZSA9IG5ld05vZGU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByb290RG9tTm9kZTtcbn1cblxuZnVuY3Rpb24gYXBwbHlQYXRjaChkb21Ob2RlLCBwYXRjaClcbntcblx0c3dpdGNoIChwYXRjaC50eXBlKVxuXHR7XG5cdFx0Y2FzZSAncC1yZWRyYXcnOlxuXHRcdFx0cmV0dXJuIGFwcGx5UGF0Y2hSZWRyYXcoZG9tTm9kZSwgcGF0Y2guZGF0YSwgcGF0Y2guZXZlbnROb2RlKTtcblxuXHRcdGNhc2UgJ3AtZmFjdHMnOlxuXHRcdFx0YXBwbHlGYWN0cyhkb21Ob2RlLCBwYXRjaC5ldmVudE5vZGUsIHBhdGNoLmRhdGEpO1xuXHRcdFx0cmV0dXJuIGRvbU5vZGU7XG5cblx0XHRjYXNlICdwLXRleHQnOlxuXHRcdFx0ZG9tTm9kZS5yZXBsYWNlRGF0YSgwLCBkb21Ob2RlLmxlbmd0aCwgcGF0Y2guZGF0YSk7XG5cdFx0XHRyZXR1cm4gZG9tTm9kZTtcblxuXHRcdGNhc2UgJ3AtdGh1bmsnOlxuXHRcdFx0cmV0dXJuIGFwcGx5UGF0Y2hlc0hlbHAoZG9tTm9kZSwgcGF0Y2guZGF0YSk7XG5cblx0XHRjYXNlICdwLXRhZ2dlcic6XG5cdFx0XHRkb21Ob2RlLmVsbV9ldmVudF9ub2RlX3JlZi50YWdnZXIgPSBwYXRjaC5kYXRhO1xuXHRcdFx0cmV0dXJuIGRvbU5vZGU7XG5cblx0XHRjYXNlICdwLXJlbW92ZS1sYXN0Jzpcblx0XHRcdHZhciBpID0gcGF0Y2guZGF0YTtcblx0XHRcdHdoaWxlIChpLS0pXG5cdFx0XHR7XG5cdFx0XHRcdGRvbU5vZGUucmVtb3ZlQ2hpbGQoZG9tTm9kZS5sYXN0Q2hpbGQpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGRvbU5vZGU7XG5cblx0XHRjYXNlICdwLWFwcGVuZCc6XG5cdFx0XHR2YXIgbmV3Tm9kZXMgPSBwYXRjaC5kYXRhO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBuZXdOb2Rlcy5sZW5ndGg7IGkrKylcblx0XHRcdHtcblx0XHRcdFx0ZG9tTm9kZS5hcHBlbmRDaGlsZChyZW5kZXIobmV3Tm9kZXNbaV0sIHBhdGNoLmV2ZW50Tm9kZSkpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGRvbU5vZGU7XG5cblx0XHRjYXNlICdwLXJlbW92ZSc6XG5cdFx0XHR2YXIgZGF0YSA9IHBhdGNoLmRhdGE7XG5cdFx0XHRpZiAodHlwZW9mIGRhdGEgPT09ICd1bmRlZmluZWQnKVxuXHRcdFx0e1xuXHRcdFx0XHRkb21Ob2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tTm9kZSk7XG5cdFx0XHRcdHJldHVybiBkb21Ob2RlO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGVudHJ5ID0gZGF0YS5lbnRyeTtcblx0XHRcdGlmICh0eXBlb2YgZW50cnkuaW5kZXggIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0e1xuXHRcdFx0XHRkb21Ob2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZG9tTm9kZSk7XG5cdFx0XHR9XG5cdFx0XHRlbnRyeS5kYXRhID0gYXBwbHlQYXRjaGVzSGVscChkb21Ob2RlLCBkYXRhLnBhdGNoZXMpO1xuXHRcdFx0cmV0dXJuIGRvbU5vZGU7XG5cblx0XHRjYXNlICdwLXJlb3JkZXInOlxuXHRcdFx0cmV0dXJuIGFwcGx5UGF0Y2hSZW9yZGVyKGRvbU5vZGUsIHBhdGNoKTtcblxuXHRcdGNhc2UgJ3AtY3VzdG9tJzpcblx0XHRcdHZhciBpbXBsID0gcGF0Y2guZGF0YTtcblx0XHRcdHJldHVybiBpbXBsLmFwcGx5UGF0Y2goZG9tTm9kZSwgaW1wbC5kYXRhKTtcblxuXHRcdGRlZmF1bHQ6XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1JhbiBpbnRvIGFuIHVua25vd24gcGF0Y2ghJyk7XG5cdH1cbn1cblxuXG5mdW5jdGlvbiBhcHBseVBhdGNoUmVkcmF3KGRvbU5vZGUsIHZOb2RlLCBldmVudE5vZGUpXG57XG5cdHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlO1xuXHR2YXIgbmV3Tm9kZSA9IHJlbmRlcih2Tm9kZSwgZXZlbnROb2RlKTtcblxuXHRpZiAodHlwZW9mIG5ld05vZGUuZWxtX2V2ZW50X25vZGVfcmVmID09PSAndW5kZWZpbmVkJylcblx0e1xuXHRcdG5ld05vZGUuZWxtX2V2ZW50X25vZGVfcmVmID0gZG9tTm9kZS5lbG1fZXZlbnRfbm9kZV9yZWY7XG5cdH1cblxuXHRpZiAocGFyZW50Tm9kZSAmJiBuZXdOb2RlICE9PSBkb21Ob2RlKVxuXHR7XG5cdFx0cGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmV3Tm9kZSwgZG9tTm9kZSk7XG5cdH1cblx0cmV0dXJuIG5ld05vZGU7XG59XG5cblxuZnVuY3Rpb24gYXBwbHlQYXRjaFJlb3JkZXIoZG9tTm9kZSwgcGF0Y2gpXG57XG5cdHZhciBkYXRhID0gcGF0Y2guZGF0YTtcblxuXHQvLyByZW1vdmUgZW5kIGluc2VydHNcblx0dmFyIGZyYWcgPSBhcHBseVBhdGNoUmVvcmRlckVuZEluc2VydHNIZWxwKGRhdGEuZW5kSW5zZXJ0cywgcGF0Y2gpO1xuXG5cdC8vIHJlbW92YWxzXG5cdGRvbU5vZGUgPSBhcHBseVBhdGNoZXNIZWxwKGRvbU5vZGUsIGRhdGEucGF0Y2hlcyk7XG5cblx0Ly8gaW5zZXJ0c1xuXHR2YXIgaW5zZXJ0cyA9IGRhdGEuaW5zZXJ0cztcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBpbnNlcnRzLmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0dmFyIGluc2VydCA9IGluc2VydHNbaV07XG5cdFx0dmFyIGVudHJ5ID0gaW5zZXJ0LmVudHJ5O1xuXHRcdHZhciBub2RlID0gZW50cnkudGFnID09PSAnbW92ZSdcblx0XHRcdD8gZW50cnkuZGF0YVxuXHRcdFx0OiByZW5kZXIoZW50cnkudm5vZGUsIHBhdGNoLmV2ZW50Tm9kZSk7XG5cdFx0ZG9tTm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgZG9tTm9kZS5jaGlsZE5vZGVzW2luc2VydC5pbmRleF0pO1xuXHR9XG5cblx0Ly8gYWRkIGVuZCBpbnNlcnRzXG5cdGlmICh0eXBlb2YgZnJhZyAhPT0gJ3VuZGVmaW5lZCcpXG5cdHtcblx0XHRkb21Ob2RlLmFwcGVuZENoaWxkKGZyYWcpO1xuXHR9XG5cblx0cmV0dXJuIGRvbU5vZGU7XG59XG5cblxuZnVuY3Rpb24gYXBwbHlQYXRjaFJlb3JkZXJFbmRJbnNlcnRzSGVscChlbmRJbnNlcnRzLCBwYXRjaClcbntcblx0aWYgKHR5cGVvZiBlbmRJbnNlcnRzID09PSAndW5kZWZpbmVkJylcblx0e1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGVuZEluc2VydHMubGVuZ3RoOyBpKyspXG5cdHtcblx0XHR2YXIgaW5zZXJ0ID0gZW5kSW5zZXJ0c1tpXTtcblx0XHR2YXIgZW50cnkgPSBpbnNlcnQuZW50cnk7XG5cdFx0ZnJhZy5hcHBlbmRDaGlsZChlbnRyeS50YWcgPT09ICdtb3ZlJ1xuXHRcdFx0PyBlbnRyeS5kYXRhXG5cdFx0XHQ6IHJlbmRlcihlbnRyeS52bm9kZSwgcGF0Y2guZXZlbnROb2RlKVxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIGZyYWc7XG59XG5cblxuXG4vLy8vLy8vLy8vLy8gIFBST0dSQU1TICAvLy8vLy8vLy8vLy9cblxuXG5mdW5jdGlvbiBwcm9ncmFtV2l0aEZsYWdzKGRldGFpbHMpXG57XG5cdHJldHVybiB7XG5cdFx0aW5pdDogZGV0YWlscy5pbml0LFxuXHRcdHVwZGF0ZTogZGV0YWlscy51cGRhdGUsXG5cdFx0c3Vic2NyaXB0aW9uczogZGV0YWlscy5zdWJzY3JpcHRpb25zLFxuXHRcdHZpZXc6IGRldGFpbHMudmlldyxcblx0XHRyZW5kZXJlcjogcmVuZGVyZXJcblx0fTtcbn1cblxuXG5yZXR1cm4ge1xuXHRub2RlOiBub2RlLFxuXHR0ZXh0OiB0ZXh0LFxuXG5cdGN1c3RvbTogY3VzdG9tLFxuXG5cdG1hcDogRjIobWFwKSxcblxuXHRvbjogRjMob24pLFxuXHRzdHlsZTogc3R5bGUsXG5cdHByb3BlcnR5OiBGMihwcm9wZXJ0eSksXG5cdGF0dHJpYnV0ZTogRjIoYXR0cmlidXRlKSxcblx0YXR0cmlidXRlTlM6IEYzKGF0dHJpYnV0ZU5TKSxcblxuXHRsYXp5OiBGMihsYXp5KSxcblx0bGF6eTI6IEYzKGxhenkyKSxcblx0bGF6eTM6IEY0KGxhenkzKSxcblx0a2V5ZWROb2RlOiBGMyhrZXllZE5vZGUpLFxuXG5cdHByb2dyYW1XaXRoRmxhZ3M6IHByb2dyYW1XaXRoRmxhZ3Ncbn07XG5cbn0oKTtcbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRwcm9ncmFtV2l0aEZsYWdzID0gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJE5hdGl2ZV9WaXJ0dWFsRG9tLnByb2dyYW1XaXRoRmxhZ3M7XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20ka2V5ZWROb2RlID0gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJE5hdGl2ZV9WaXJ0dWFsRG9tLmtleWVkTm9kZTtcbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRsYXp5MyA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSROYXRpdmVfVmlydHVhbERvbS5sYXp5MztcbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRsYXp5MiA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSROYXRpdmVfVmlydHVhbERvbS5sYXp5MjtcbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRsYXp5ID0gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJE5hdGl2ZV9WaXJ0dWFsRG9tLmxhenk7XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kZGVmYXVsdE9wdGlvbnMgPSB7c3RvcFByb3BhZ2F0aW9uOiBmYWxzZSwgcHJldmVudERlZmF1bHQ6IGZhbHNlfTtcbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRvbldpdGhPcHRpb25zID0gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJE5hdGl2ZV9WaXJ0dWFsRG9tLm9uO1xudmFyIF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJG9uID0gRjIoXG5cdGZ1bmN0aW9uIChldmVudE5hbWUsIGRlY29kZXIpIHtcblx0XHRyZXR1cm4gQTMoX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kb25XaXRoT3B0aW9ucywgZXZlbnROYW1lLCBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRkZWZhdWx0T3B0aW9ucywgZGVjb2Rlcik7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJHN0eWxlID0gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJE5hdGl2ZV9WaXJ0dWFsRG9tLnN0eWxlO1xudmFyIF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJGF0dHJpYnV0ZU5TID0gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJE5hdGl2ZV9WaXJ0dWFsRG9tLmF0dHJpYnV0ZU5TO1xudmFyIF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJGF0dHJpYnV0ZSA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSROYXRpdmVfVmlydHVhbERvbS5hdHRyaWJ1dGU7XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kcHJvcGVydHkgPSBfZWxtX2xhbmckdmlydHVhbF9kb20kTmF0aXZlX1ZpcnR1YWxEb20ucHJvcGVydHk7XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kbWFwID0gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJE5hdGl2ZV9WaXJ0dWFsRG9tLm1hcDtcbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSR0ZXh0ID0gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJE5hdGl2ZV9WaXJ0dWFsRG9tLnRleHQ7XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kbm9kZSA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSROYXRpdmVfVmlydHVhbERvbS5ub2RlO1xudmFyIF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJE9wdGlvbnMgPSBGMihcblx0ZnVuY3Rpb24gKGEsIGIpIHtcblx0XHRyZXR1cm4ge3N0b3BQcm9wYWdhdGlvbjogYSwgcHJldmVudERlZmF1bHQ6IGJ9O1xuXHR9KTtcbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSROb2RlID0ge2N0b3I6ICdOb2RlJ307XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kUHJvcGVydHkgPSB7Y3RvcjogJ1Byb3BlcnR5J307XG5cbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHRleHQgPSBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSR0ZXh0O1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJG5vZGU7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRib2R5ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdib2R5Jyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRzZWN0aW9uID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdzZWN0aW9uJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRuYXYgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ25hdicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkYXJ0aWNsZSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnYXJ0aWNsZScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkYXNpZGUgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2FzaWRlJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRoMSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnaDEnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGgyID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdoMicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkaDMgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2gzJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRoNCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnaDQnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGg1ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdoNScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkaDYgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2g2Jyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRoZWFkZXIgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2hlYWRlcicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkZm9vdGVyID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdmb290ZXInKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGFkZHJlc3MgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2FkZHJlc3MnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJG1haW4kID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdtYWluJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRwID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdwJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRociA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnaHInKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHByZSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgncHJlJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRibG9ja3F1b3RlID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdibG9ja3F1b3RlJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRvbCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnb2wnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHVsID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCd1bCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkbGkgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2xpJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRkbCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnZGwnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGR0ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdkdCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkZGQgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2RkJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRmaWd1cmUgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2ZpZ3VyZScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkZmlnY2FwdGlvbiA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnZmlnY2FwdGlvbicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkZGl2ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdkaXYnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGEgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2EnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGVtID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdlbScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkc3Ryb25nID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdzdHJvbmcnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHNtYWxsID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdzbWFsbCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkcyA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgncycpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkY2l0ZSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnY2l0ZScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkcSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgncScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkZGZuID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdkZm4nKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGFiYnIgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2FiYnInKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHRpbWUgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3RpbWUnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGNvZGUgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2NvZGUnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHZhciA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgndmFyJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRzYW1wID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdzYW1wJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRrYmQgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2tiZCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkc3ViID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdzdWInKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHN1cCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnc3VwJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRpID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdpJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRiID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdiJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR1ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCd1Jyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRtYXJrID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdtYXJrJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRydWJ5ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdydWJ5Jyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRydCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgncnQnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHJwID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdycCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkYmRpID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdiZGknKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGJkbyA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnYmRvJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRzcGFuID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdzcGFuJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRiciA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnYnInKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHdiciA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnd2JyJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRpbnMgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2lucycpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkZGVsID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdkZWwnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGltZyA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnaW1nJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRpZnJhbWUgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2lmcmFtZScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkZW1iZWQgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2VtYmVkJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRvYmplY3QgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ29iamVjdCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkcGFyYW0gPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3BhcmFtJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR2aWRlbyA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgndmlkZW8nKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGF1ZGlvID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdhdWRpbycpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkc291cmNlID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdzb3VyY2UnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHRyYWNrID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCd0cmFjaycpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkY2FudmFzID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdjYW52YXMnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHN2ZyA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnc3ZnJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRtYXRoID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdtYXRoJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR0YWJsZSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgndGFibGUnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGNhcHRpb24gPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2NhcHRpb24nKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGNvbGdyb3VwID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdjb2xncm91cCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkY29sID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdjb2wnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHRib2R5ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCd0Ym9keScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkdGhlYWQgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3RoZWFkJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR0Zm9vdCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgndGZvb3QnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHRyID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCd0cicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkdGQgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3RkJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR0aCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgndGgnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGZvcm0gPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2Zvcm0nKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGZpZWxkc2V0ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdmaWVsZHNldCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkbGVnZW5kID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdsZWdlbmQnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGxhYmVsID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdsYWJlbCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkaW5wdXQgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2lucHV0Jyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRidXR0b24gPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2J1dHRvbicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkc2VsZWN0ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdzZWxlY3QnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGRhdGFsaXN0ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdkYXRhbGlzdCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkb3B0Z3JvdXAgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ29wdGdyb3VwJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRvcHRpb24gPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ29wdGlvbicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkdGV4dGFyZWEgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3RleHRhcmVhJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRrZXlnZW4gPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2tleWdlbicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkb3V0cHV0ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdvdXRwdXQnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHByb2dyZXNzID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdwcm9ncmVzcycpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkbWV0ZXIgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ21ldGVyJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRkZXRhaWxzID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdkZXRhaWxzJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRzdW1tYXJ5ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdzdW1tYXJ5Jyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRtZW51aXRlbSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnbWVudWl0ZW0nKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJG1lbnUgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ21lbnUnKTtcblxudmFyIF9lbG1fbGFuZyRodG1sJEh0bWxfQXBwJHByb2dyYW1XaXRoRmxhZ3MgPSBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRwcm9ncmFtV2l0aEZsYWdzO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWxfQXBwJHByb2dyYW0gPSBmdW5jdGlvbiAoYXBwKSB7XG5cdHJldHVybiBfZWxtX2xhbmckaHRtbCRIdG1sX0FwcCRwcm9ncmFtV2l0aEZsYWdzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy51cGRhdGUoXG5cdFx0XHRhcHAsXG5cdFx0XHR7XG5cdFx0XHRcdGluaXQ6IGZ1bmN0aW9uIChfcDApIHtcblx0XHRcdFx0XHRyZXR1cm4gYXBwLmluaXQ7XG5cdFx0XHRcdH1cblx0XHRcdH0pKTtcbn07XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbF9BcHAkYmVnaW5uZXJQcm9ncmFtID0gZnVuY3Rpb24gKF9wMSkge1xuXHR2YXIgX3AyID0gX3AxO1xuXHRyZXR1cm4gX2VsbV9sYW5nJGh0bWwkSHRtbF9BcHAkcHJvZ3JhbVdpdGhGbGFncyhcblx0XHR7XG5cdFx0XHRpbml0OiBmdW5jdGlvbiAoX3AzKSB7XG5cdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWRfb3BzWychJ10sXG5cdFx0XHRcdFx0X3AyLm1vZGVsLFxuXHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0XHRcdFtdKSk7XG5cdFx0XHR9LFxuXHRcdFx0dXBkYXRlOiBGMihcblx0XHRcdFx0ZnVuY3Rpb24gKG1zZywgbW9kZWwpIHtcblx0XHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWRfb3BzWychJ10sXG5cdFx0XHRcdFx0XHRBMihfcDIudXBkYXRlLCBtc2csIG1vZGVsKSxcblx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0XHRcdFx0W10pKTtcblx0XHRcdFx0fSksXG5cdFx0XHR2aWV3OiBfcDIudmlldyxcblx0XHRcdHN1YnNjcmlwdGlvbnM6IGZ1bmN0aW9uIChfcDQpIHtcblx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX1N1YiRub25lO1xuXHRcdFx0fVxuXHRcdH0pO1xufTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sX0FwcCRtYXAgPSBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRtYXA7XG5cbi8qIGdsb2JhbHMgRWxtICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuZXctY2FwLCBuby11bmRlcnNjb3JlLWRhbmdsZSAqL1xuXG4vKipcbiAqIElmIGl0J3Mgbm90IGEgTWF5YmUsIHJldHVybnMgd2hhdGV2ZXIgdmFsdWUgdGhhdCBpcywgaWYgaXQgaXNcbiAqIGEgTWF5YmUsIHJldHVybnMgYHZhbHVlYCBmb3IgYEp1c3QgdmFsdWVgIGFuZCBgbnVsbGAgZm9yIGBOb3RoaW5nYFxuICogQG1ldGhvZCBmcm9tTWF5YmVcbiAqIEBwYXJhbSAge09iamVjdDxBbnk+IHwgQW55IH0gdmFsXG4gKiBAcmV0dXJuIHtBbnl9XG4gKi9cbmNvbnN0IGZyb21NYXliZSA9IHZhbCA9PiB7XG4gIGNvbnN0IGlzTWF5YmUgPSB2YWwgJiYgdmFsLmN0b3I7XG5cbiAgaWYgKCFpc01heWJlKSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIHJldHVybiB2YWwuXzAgPyB2YWwuXzAgOiBudWxsO1xufTtcblxuY29uc3QgcGFyc2VFbG1MaXN0ID0gbCA9PiB7XG4gIGlmIChBcnJheS5pc0FycmF5KGwpKSB7XG4gICAgcmV0dXJuIGw7XG4gIH1cblxuICBsZXQgbGlzdCA9IFtdXG4gIGxldCBjb3VudGVyID0gMFxuICBsZXQga2V5ID0gYF8ke2NvdW50ZXJ9YDtcbiAgd2hpbGUgKGxba2V5XSAhPT0gdW5kZWZpbmVkICYmIGxba2V5XS5jdG9yICE9PSAnW10nKSB7XG4gICAgbGlzdCA9IGxpc3QuY29uY2F0KGxba2V5XSk7XG4gICAgY291bnRlciA9IGNvdW50ZXIgKyAxXG4gICAga2V5ID0gYF8ke2NvdW50ZXJ9YDtcbiAgfVxuXG4gIHJldHVybiBsaXN0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gRWxtIGFjY2VwdGFibGUgTW9kYWwgb2JqZWN0XG4gKiBAbWV0aG9kIE1vZGFsXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0gIHtTdHJpbmcgfCBNYXliZSBTdHJpbmd9IHRhcmdldFVybFxuICovXG5jb25zdCBNb2RhbCA9IGZ1bmN0aW9uICh7IHNlbGVjdG9yLCB0YXJnZXRVcmwgfSA9IHt9KSB7XG4gIGlmICghc2VsZWN0b3IpIHtcbiAgICAvLyBJdCB3YXMgbm90IHNldCBieSBFbG1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHVybCA9IGZyb21NYXliZSh0YXJnZXRVcmwpO1xuICByZXR1cm4geyBzZWxlY3RvciwgdGFyZ2V0VXJsOiB1cmwgfTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBFbG0gYWNjZXB0YWJsZSBIaXN0b3J5U3RhdGUgb2JqZWN0XG4gKiBUaGlzIGlzIHVzZWQgdG8gbWFrZSB0aGUgbGluayBFbG0tSlMgYW5kIEpTLUVsbVxuICogQG1ldGhvZCBIaXN0b3J5U3RhdGVcbiAqIEBwYXJhbSAge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0gIHtBcnJheTxNb2RhbD59XG4gKi9cbmNvbnN0IEhpc3RvcnlTdGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICBjb25zdCB7IHVybCwgb3Blbk1vZGFscywgc2Vzc2lvbklkIH0gPSBzdGF0ZSB8fCB7fTtcbiAgaWYgKCF1cmwpIHtcbiAgICAvLyBJdCB3YXMgbm90IHNldCBieSBFbG1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IG1vZGFscyA9IHBhcnNlRWxtTGlzdChvcGVuTW9kYWxzKS5tYXAoTW9kYWwpO1xuICBtb2RhbHMuZm9yRWFjaChtID0+IHtcbiAgICBpZiAoIW0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0EgbnVsbCBtb2RhbCB3YXMgZm91bmQgaW4gYSBoaXN0b3J5IHN0YXRlLiAnXG4gICAgICAgICsgYFNvbWV0aGluZyBpcyB3cm9uZy4gSGVyZSBhcmUgYWxsIHRoZSBtb2RhbHMgJHtKU09OLnN0cmluZ2lmeShtb2RhbHMpfWBcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHsgdXJsLCBzZXNzaW9uSWQsIG9wZW5Nb2RhbHM6IG1vZGFscyB9O1xufTtcblxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09IEVMTSBOQVRJVkUgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5cbmNvbnN0IF91c2VyJHByb2plY3QkTmF0aXZlX0hpc3RvcnkgPSB7XG4gIHB1c2hTdGF0ZTogKHN0YXRlKSA9PiB7XG4gICAgY29uc3QgaGlzdFN0YXRlID0gSGlzdG9yeVN0YXRlKHN0YXRlKTtcbiAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUoaGlzdFN0YXRlLCAnbW9kYWwtcm91dGVyLXN0YXRlJywgaGlzdFN0YXRlLnVybClcbiAgfSxcbiAgcmVwbGFjZVN0YXRlOiAoc3RhdGUpID0+IHtcbiAgICBjb25zdCBoaXN0U3RhdGUgPSBIaXN0b3J5U3RhdGUoc3RhdGUpO1xuICAgIHdpbmRvdy5oaXN0b3J5LnJlcGxhY2VTdGF0ZShoaXN0U3RhdGUsICdtb2RhbC1yb3V0ZXItc3RhdGUnLCBoaXN0U3RhdGUudXJsKVxuICB9LFxuICBnZXRTdGF0ZTogKCkgPT4gSGlzdG9yeVN0YXRlKHdpbmRvdy5oaXN0b3J5LnN0YXRlKSxcbn07XG5cbi8qIGdsb2JhbCAkKi9cbnZhciBfdXNlciRwcm9qZWN0JE5hdGl2ZV9Nb2RhbCA9IHtcbiAgb3BlbjogKHNlbGVjdG9yKSA9PiB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgJChzZWxlY3RvcikubW9kYWwoJ3Nob3cnKTtcbiAgfSxcbiAgY2xvc2U6IChzZWxlY3RvcikgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICQoc2VsZWN0b3IpLm1vZGFsKCdoaWRlJyk7XG4gIH0sXG4gIGdldE9wZW46ICgpID0+IHtcbiAgICByZXR1cm4gWydteUlkJ107IC8vIFRPRE86IGltcGxlbWVudCB0aGlzXG4gIH0sXG59O1xuXG52YXIgX3VzZXIkcHJvamVjdCRNb2RhbCRnZXRPcGVuID0gZnVuY3Rpb24gKGEpIHtcblx0cmV0dXJuIF91c2VyJHByb2plY3QkTmF0aXZlX01vZGFsLmdldE9wZW4oXG5cdFx0e2N0b3I6ICdfVHVwbGUwJ30pO1xufTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsJGNsb3NlID0gZnVuY3Rpb24gKG1vZGFsKSB7XG5cdHJldHVybiBBMihcblx0XHRfZWxtX2xhbmckY29yZSRCYXNpY3MkYWx3YXlzLFxuXHRcdF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZCRub25lLFxuXHRcdF91c2VyJHByb2plY3QkTmF0aXZlX01vZGFsLmNsb3NlKG1vZGFsLnNlbGVjdG9yKSk7XG59O1xudmFyIF91c2VyJHByb2plY3QkTW9kYWwkb3BlbiA9IGZ1bmN0aW9uIChtb2RhbCkge1xuXHRyZXR1cm4gQTIoXG5cdFx0X2VsbV9sYW5nJGNvcmUkQmFzaWNzJGFsd2F5cyxcblx0XHRfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWQkbm9uZSxcblx0XHRfdXNlciRwcm9qZWN0JE5hdGl2ZV9Nb2RhbC5vcGVuKG1vZGFsLnNlbGVjdG9yKSk7XG59O1xudmFyIF91c2VyJHByb2plY3QkTW9kYWwkTW9kYWwgPSBGMihcblx0ZnVuY3Rpb24gKGEsIGIpIHtcblx0XHRyZXR1cm4ge3NlbGVjdG9yOiBhLCB0YXJnZXRVcmw6IGJ9O1xuXHR9KTtcblxudmFyIF91c2VyJHByb2plY3QkTmF0aXZlX1VyaSA9IHtcbiAgZW5jb2RlVXJpOiBlbmNvZGVVUkksXG4gIGVuY29kZVVyaUNvbXBvbmVudDogZW5jb2RlVVJJQ29tcG9uZW50LFxuICBnZXRDdXJyZW50OiAoKSA9PiB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUsXG59O1xuXG52YXIgX3VzZXIkcHJvamVjdCRVcmkkZ2V0Q3VycmVudCA9IGZ1bmN0aW9uIChhKSB7XG5cdHJldHVybiBfdXNlciRwcm9qZWN0JE5hdGl2ZV9VcmkuZ2V0Q3VycmVudChcblx0XHR7Y3RvcjogJ19UdXBsZTAnfSk7XG59O1xudmFyIF91c2VyJHByb2plY3QkVXJpJGVuY29kZVVyaUNvbXBvbmVudCA9IGZ1bmN0aW9uIChzdHIpIHtcblx0cmV0dXJuIF91c2VyJHByb2plY3QkTmF0aXZlX1VyaS5lbmNvZGVVcmlDb21wb25lbnQoc3RyKTtcbn07XG52YXIgX3VzZXIkcHJvamVjdCRVcmkkZW5jb2RlVXJpID0gZnVuY3Rpb24gKHN0cikge1xuXHRyZXR1cm4gX3VzZXIkcHJvamVjdCROYXRpdmVfVXJpLmVuY29kZVVyaShzdHIpO1xufTtcblxudmFyIF91c2VyJHByb2plY3QkSGlzdG9yeSRnZXRTdGF0ZSA9IGZ1bmN0aW9uIChhKSB7XG5cdHJldHVybiBfdXNlciRwcm9qZWN0JE5hdGl2ZV9IaXN0b3J5LmdldFN0YXRlKGEpO1xufTtcbnZhciBfdXNlciRwcm9qZWN0JEhpc3RvcnkkcmVwbGFjZVN0YXRlID0gZnVuY3Rpb24gKGhpc3QpIHtcblx0cmV0dXJuIEEyKFxuXHRcdF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRhbHdheXMsXG5cdFx0X2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fQ21kJG5vbmUsXG5cdFx0X3VzZXIkcHJvamVjdCROYXRpdmVfSGlzdG9yeS5yZXBsYWNlU3RhdGUoaGlzdCkpO1xufTtcbnZhciBfdXNlciRwcm9qZWN0JEhpc3RvcnkkcHVzaFN0YXRlID0gZnVuY3Rpb24gKGhpc3QpIHtcblx0cmV0dXJuIEEyKFxuXHRcdF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRhbHdheXMsXG5cdFx0X2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fQ21kJG5vbmUsXG5cdFx0X3VzZXIkcHJvamVjdCROYXRpdmVfSGlzdG9yeS5wdXNoU3RhdGUoXG5cdFx0XHRBMihfZWxtX2xhbmckY29yZSREZWJ1ZyRsb2csICdQdXNoaW5nIGhpc3Rvcnk6ICcsIGhpc3QpKSk7XG59O1xudmFyIF91c2VyJHByb2plY3QkSGlzdG9yeSRIaXN0b3J5U3RhdGUgPSBGMyhcblx0ZnVuY3Rpb24gKGEsIGIsIGMpIHtcblx0XHRyZXR1cm4ge29wZW5Nb2RhbHM6IGEsIHVybDogYiwgc2Vzc2lvbklkOiBjfTtcblx0fSk7XG5cbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1R5cGVzJE1vZGVsID0gRjMoXG5cdGZ1bmN0aW9uIChhLCBiLCBjKSB7XG5cdFx0cmV0dXJuIHtvcGVuTW9kYWxzOiBhLCBpbml0aWFsVXJsOiBiLCBzZXNzaW9uSWQ6IGN9O1xuXHR9KTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1R5cGVzJE1vZGFsQ2xvc2UgPSBmdW5jdGlvbiAoYSkge1xuXHRyZXR1cm4ge2N0b3I6ICdNb2RhbENsb3NlJywgXzA6IGF9O1xufTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1R5cGVzJE1vZGFsT3BlbiA9IGZ1bmN0aW9uIChhKSB7XG5cdHJldHVybiB7Y3RvcjogJ01vZGFsT3BlbicsIF8wOiBhfTtcbn07XG52YXIgX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9UeXBlcyRQb3BTdGF0ZSA9IGZ1bmN0aW9uIChhKSB7XG5cdHJldHVybiB7Y3RvcjogJ1BvcFN0YXRlJywgXzA6IGF9O1xufTtcblxudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkdG9IaXN0b3J5U3RhdGUgPSBmdW5jdGlvbiAoX3AwKSB7XG5cdHZhciBfcDEgPSBfcDA7XG5cdHZhciBfcDIgPSBfcDEub3Blbk1vZGFscztcblx0dmFyIHN0YXRlVXJsID0gQTIoXG5cdFx0X2VsbV9sYW5nJGNvcmUkTWF5YmUkd2l0aERlZmF1bHQsXG5cdFx0X3AxLmluaXRpYWxVcmwsXG5cdFx0QTMoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRCYXNpY3MkZmxpcCxcblx0XHRcdF9lbG1fbGFuZyRjb3JlJE1heWJlJGFuZFRoZW4sXG5cdFx0XHRmdW5jdGlvbiAoeCkge1xuXHRcdFx0XHRyZXR1cm4geC50YXJnZXRVcmw7XG5cdFx0XHR9LFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRoZWFkKF9wMikpKTtcblx0cmV0dXJuIEEzKF91c2VyJHByb2plY3QkSGlzdG9yeSRIaXN0b3J5U3RhdGUsIF9wMiwgc3RhdGVVcmwsIF9wMS5zZXNzaW9uSWQpO1xufTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJHB1c2hTdGF0ZSA9IGZ1bmN0aW9uIChtb2RlbCkge1xuXHRyZXR1cm4gX3VzZXIkcHJvamVjdCRIaXN0b3J5JHB1c2hTdGF0ZShcblx0XHRfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJHRvSGlzdG9yeVN0YXRlKG1vZGVsKSk7XG59O1xudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkcmVwbGFjZVN0YXRlID0gZnVuY3Rpb24gKG1vZGVsKSB7XG5cdHJldHVybiBfdXNlciRwcm9qZWN0JEhpc3RvcnkkcmVwbGFjZVN0YXRlKFxuXHRcdF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkdG9IaXN0b3J5U3RhdGUobW9kZWwpKTtcbn07XG52YXIgX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRtaXNzaW5nSW4gPSBGMihcblx0ZnVuY3Rpb24gKGEsIGIpIHtcblx0XHRyZXR1cm4gQTIoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGZpbHRlcixcblx0XHRcdGZ1bmN0aW9uICh4KSB7XG5cdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRCYXNpY3Mkbm90KFxuXHRcdFx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJExpc3QkbWVtYmVyLCB4LCBiKSk7XG5cdFx0XHR9LFxuXHRcdFx0YSk7XG5cdH0pO1xudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkY29uZm9ybVdpbmRvd1RvU3RhdGUgPSBGMihcblx0ZnVuY3Rpb24gKHN0YXRlLCBtb2RlbCkge1xuXHRcdHZhciBtb2RhbHNUb0Nsb3NlID0gQTIoX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRtaXNzaW5nSW4sIG1vZGVsLm9wZW5Nb2RhbHMsIHN0YXRlLm9wZW5Nb2RhbHMpO1xuXHRcdHZhciBtb2RhbHNUb09wZW4gPSBBMihfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJG1pc3NpbmdJbiwgc3RhdGUub3Blbk1vZGFscywgbW9kZWwub3Blbk1vZGFscyk7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZCRiYXRjaChcblx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkY29uY2F0KFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0QTIoX2VsbV9sYW5nJGNvcmUkTGlzdCRtYXAsIF91c2VyJHByb2plY3QkTW9kYWwkb3BlbiwgbW9kYWxzVG9PcGVuKSxcblx0XHRcdFx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJExpc3QkbWFwLCBfdXNlciRwcm9qZWN0JE1vZGFsJGNsb3NlLCBtb2RhbHNUb0Nsb3NlKSxcblx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdFx0X3VzZXIkcHJvamVjdCRIaXN0b3J5JHJlcGxhY2VTdGF0ZShzdGF0ZSlcblx0XHRcdFx0XHRcdF0pXG5cdFx0XHRcdFx0XSkpKTtcblx0fSk7XG52YXIgX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRpc01vZGFsT3BlbiA9IEYyKFxuXHRmdW5jdGlvbiAob3Blbk1vZGFscywgc2VsZWN0b3IpIHtcblx0XHRyZXR1cm4gQTIoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0JG1lbWJlcixcblx0XHRcdHNlbGVjdG9yLFxuXHRcdFx0QTIoXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkbWFwLFxuXHRcdFx0XHRmdW5jdGlvbiAobSkge1xuXHRcdFx0XHRcdHJldHVybiBtLnNlbGVjdG9yO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRvcGVuTW9kYWxzKSk7XG5cdH0pO1xudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkaW5pdCA9IGZ1bmN0aW9uIChzZXNzaW9uSWQpIHtcblx0dmFyIGN1cnJlbnRPcGVuTW9kYWxzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFtdKTtcblx0dmFyIGN1cnJlbnRVcmwgPSBfdXNlciRwcm9qZWN0JFVyaSRnZXRDdXJyZW50KFxuXHRcdHtjdG9yOiAnX1R1cGxlMCd9KTtcblx0dmFyIGluaXRpYWxNb2RlbCA9IEEzKF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfVHlwZXMkTW9kZWwsIGN1cnJlbnRPcGVuTW9kYWxzLCBjdXJyZW50VXJsLCBzZXNzaW9uSWQpO1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRfMDogaW5pdGlhbE1vZGVsLFxuXHRcdF8xOiBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJHJlcGxhY2VTdGF0ZShpbml0aWFsTW9kZWwpXG5cdH07XG59O1xudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkb25Qb3BTdGF0ZSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9QbGF0Zm9ybS5pbmNvbWluZ1BvcnQoXG5cdCdvblBvcFN0YXRlJyxcblx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkb25lT2YoXG5cdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0W1xuXHRcdFx0XHRfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRudWxsKF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmcpLFxuXHRcdFx0XHRBMihcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkbWFwLFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0LFxuXHRcdFx0XHRBMihcblx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRhbmRUaGVuLFxuXHRcdFx0XHRcdEEyKFxuXHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGVfb3BzWyc6PSddLFxuXHRcdFx0XHRcdFx0J29wZW5Nb2RhbHMnLFxuXHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkbGlzdChcblx0XHRcdFx0XHRcdFx0QTIoXG5cdFx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkYW5kVGhlbixcblx0XHRcdFx0XHRcdFx0XHRBMihfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZV9vcHNbJzo9J10sICdzZWxlY3RvcicsIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHN0cmluZyksXG5cdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGFuZFRoZW4sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdEEyKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlX29wc1snOj0nXSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQndGFyZ2V0VXJsJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRvbmVPZihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG51bGwoX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZyksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0QTIoX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkbWFwLCBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0LCBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRzdHJpbmcpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF0pKSksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uICh0YXJnZXRVcmwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkc3VjY2VlZChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHtzZWxlY3Rvcjogc2VsZWN0b3IsIHRhcmdldFVybDogdGFyZ2V0VXJsfSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdH0pKSksXG5cdFx0XHRcdFx0ZnVuY3Rpb24gKG9wZW5Nb2RhbHMpIHtcblx0XHRcdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkYW5kVGhlbixcblx0XHRcdFx0XHRcdFx0QTIoX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGVfb3BzWyc6PSddLCAndXJsJywgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkc3RyaW5nKSxcblx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKHVybCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGFuZFRoZW4sXG5cdFx0XHRcdFx0XHRcdFx0XHRBMihfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZV9vcHNbJzo9J10sICdzZXNzaW9uSWQnLCBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRpbnQpLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKHNlc3Npb25JZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkc3VjY2VlZChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7b3Blbk1vZGFsczogb3Blbk1vZGFscywgdXJsOiB1cmwsIHNlc3Npb25JZDogc2Vzc2lvbklkfSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSkpXG5cdFx0XHRdKSkpO1xudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkb25Nb2RhbE9wZW4gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfUGxhdGZvcm0uaW5jb21pbmdQb3J0KFxuXHQnb25Nb2RhbE9wZW4nLFxuXHRBMihcblx0XHRfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRhbmRUaGVuLFxuXHRcdEEyKF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlX29wc1snOj0nXSwgJ3NlbGVjdG9yJywgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkc3RyaW5nKSxcblx0XHRmdW5jdGlvbiAoc2VsZWN0b3IpIHtcblx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkYW5kVGhlbixcblx0XHRcdFx0QTIoXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGVfb3BzWyc6PSddLFxuXHRcdFx0XHRcdCd0YXJnZXRVcmwnLFxuXHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG9uZU9mKFxuXHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRcdFx0XHRbXG5cdFx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkbnVsbChfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nKSxcblx0XHRcdFx0XHRcdFx0XHRBMihfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRtYXAsIF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QsIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHN0cmluZylcblx0XHRcdFx0XHRcdFx0XSkpKSxcblx0XHRcdFx0ZnVuY3Rpb24gKHRhcmdldFVybCkge1xuXHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRzdWNjZWVkKFxuXHRcdFx0XHRcdFx0e3NlbGVjdG9yOiBzZWxlY3RvciwgdGFyZ2V0VXJsOiB0YXJnZXRVcmx9KTtcblx0XHRcdFx0fSk7XG5cdFx0fSkpO1xudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkb25Nb2RhbENsb3NlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1BsYXRmb3JtLmluY29taW5nUG9ydCgnb25Nb2RhbENsb3NlJywgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkc3RyaW5nKTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJHN1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbiAobW9kZWwpIHtcblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX1N1YiRiYXRjaChcblx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRbXG5cdFx0XHRcdF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkb25Qb3BTdGF0ZShfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1R5cGVzJFBvcFN0YXRlKSxcblx0XHRcdFx0X3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRvbk1vZGFsT3BlbihfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1R5cGVzJE1vZGFsT3BlbiksXG5cdFx0XHRcdF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkb25Nb2RhbENsb3NlKF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfVHlwZXMkTW9kYWxDbG9zZSlcblx0XHRcdF0pKTtcbn07XG52YXIgX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRyZWxvYWQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfUGxhdGZvcm0ub3V0Z29pbmdQb3J0KFxuXHQncmVsb2FkJyxcblx0ZnVuY3Rpb24gKHYpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fSk7XG52YXIgX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSR1cGRhdGUgPSBGMihcblx0ZnVuY3Rpb24gKG1zZywgbW9kZWwpIHtcblx0XHR2YXIgX3AzID0gbXNnO1xuXHRcdHN3aXRjaCAoX3AzLmN0b3IpIHtcblx0XHRcdGNhc2UgJ1BvcFN0YXRlJzpcblx0XHRcdFx0dmFyIF9wNCA9IF9wMy5fMDtcblx0XHRcdFx0aWYgKF9wNC5jdG9yID09PSAnTm90aGluZycpIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdFx0XzA6IG1vZGVsLFxuXHRcdFx0XHRcdFx0XzE6IF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkcmVwbGFjZVN0YXRlKG1vZGVsKVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFyIF9wNSA9IF9wNC5fMDtcblx0XHRcdFx0XHR2YXIgbmV3TW9kZWwgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMudXBkYXRlKFxuXHRcdFx0XHRcdFx0bW9kZWwsXG5cdFx0XHRcdFx0XHR7b3Blbk1vZGFsczogX3A1Lm9wZW5Nb2RhbHN9KTtcblx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmVxKF9wNS5zZXNzaW9uSWQsIG1vZGVsLnNlc3Npb25JZCkgPyB7XG5cdFx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XHRfMDogbmV3TW9kZWwsXG5cdFx0XHRcdFx0XHRfMTogQTIoX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRjb25mb3JtV2luZG93VG9TdGF0ZSwgX3A1LCBtb2RlbClcblx0XHRcdFx0XHR9IDoge1xuXHRcdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdFx0XzA6IG5ld01vZGVsLFxuXHRcdFx0XHRcdFx0XzE6IF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZCRiYXRjaChcblx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdFx0XHRcdF91c2VyJHByb2plY3QkSGlzdG9yeSRyZXBsYWNlU3RhdGUoX3A1KSxcblx0XHRcdFx0XHRcdFx0XHRcdF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkcmVsb2FkKFxuXHRcdFx0XHRcdFx0XHRcdFx0e2N0b3I6ICdfVHVwbGUwJ30pXG5cdFx0XHRcdFx0XHRcdFx0XSkpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0Y2FzZSAnTW9kYWxPcGVuJzpcblx0XHRcdFx0dmFyIF9wNiA9IF9wMy5fMDtcblx0XHRcdFx0dmFyIG1vZGVsUGx1c01vZGFsID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLnVwZGF0ZShcblx0XHRcdFx0XHRtb2RlbCxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRvcGVuTW9kYWxzOiBBMihfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSwgX3A2LCBtb2RlbC5vcGVuTW9kYWxzKVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR2YXIgbW9kYWxSZWdpc3RlcmVkQXNPcGVuID0gQTIoX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRpc01vZGFsT3BlbiwgbW9kZWwub3Blbk1vZGFscywgX3A2LnNlbGVjdG9yKTtcblx0XHRcdFx0cmV0dXJuIG1vZGFsUmVnaXN0ZXJlZEFzT3BlbiA/IHtjdG9yOiAnX1R1cGxlMicsIF8wOiBtb2RlbCwgXzE6IF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZCRub25lfSA6IHtcblx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XzA6IG1vZGVsUGx1c01vZGFsLFxuXHRcdFx0XHRcdF8xOiBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJHB1c2hTdGF0ZShtb2RlbFBsdXNNb2RhbClcblx0XHRcdFx0fTtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHZhciBfcDcgPSBfcDMuXzA7XG5cdFx0XHRcdHZhciBsaXN0V2l0aG91dE1vZGFsID0gQTIoXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmaWx0ZXIsXG5cdFx0XHRcdFx0ZnVuY3Rpb24gKG4pIHtcblx0XHRcdFx0XHRcdHJldHVybiAhX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmVxKG4uc2VsZWN0b3IsIF9wNyk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRtb2RlbC5vcGVuTW9kYWxzKTtcblx0XHRcdFx0dmFyIG1vZGVsTWludXNNb2RhbCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy51cGRhdGUoXG5cdFx0XHRcdFx0bW9kZWwsXG5cdFx0XHRcdFx0e29wZW5Nb2RhbHM6IGxpc3RXaXRob3V0TW9kYWx9KTtcblx0XHRcdFx0dmFyIG1vZGFsUmVnaXN0ZXJlZEFzQ2xvc2VkID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzJG5vdChcblx0XHRcdFx0XHRBMihfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJGlzTW9kYWxPcGVuLCBtb2RlbC5vcGVuTW9kYWxzLCBfcDcpKTtcblx0XHRcdFx0cmV0dXJuIG1vZGFsUmVnaXN0ZXJlZEFzQ2xvc2VkID8ge2N0b3I6ICdfVHVwbGUyJywgXzA6IG1vZGVsLCBfMTogX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fQ21kJG5vbmV9IDoge1xuXHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRfMDogbW9kZWxNaW51c01vZGFsLFxuXHRcdFx0XHRcdF8xOiBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJHB1c2hTdGF0ZShtb2RlbE1pbnVzTW9kYWwpXG5cdFx0XHRcdH07XG5cdFx0fVxuXHR9KTtcblxudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXIkdmlldyA9IGZ1bmN0aW9uIChtb2RlbCkge1xuXHRyZXR1cm4gQTIoXG5cdFx0X2VsbV9sYW5nJGh0bWwkSHRtbCRkaXYsXG5cdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0W10pLFxuXHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFtdKSk7XG59O1xudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXIkbWFpbiA9IHtcblx0bWFpbjogX2VsbV9sYW5nJGh0bWwkSHRtbF9BcHAkcHJvZ3JhbVdpdGhGbGFncyhcblx0XHR7aW5pdDogX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRpbml0LCB2aWV3OiBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyJHZpZXcsIHVwZGF0ZTogX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSR1cGRhdGUsIHN1YnNjcmlwdGlvbnM6IF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkc3Vic2NyaXB0aW9uc30pLFxuXHRmbGFnczogX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkaW50XG59O1xuXG52YXIgRWxtID0ge307XG5FbG1bJ01vZGFsUm91dGVyJ10gPSBFbG1bJ01vZGFsUm91dGVyJ10gfHwge307XG5fZWxtX2xhbmckY29yZSROYXRpdmVfUGxhdGZvcm0uYWRkUHVibGljTW9kdWxlKEVsbVsnTW9kYWxSb3V0ZXInXSwgJ01vZGFsUm91dGVyJywgdHlwZW9mIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXIkbWFpbiA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlciRtYWluKTtcblxuaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmVbJ2FtZCddKVxue1xuICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkgeyByZXR1cm4gRWxtOyB9KTtcbiAgcmV0dXJuO1xufVxuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIilcbntcbiAgbW9kdWxlWydleHBvcnRzJ10gPSBFbG07XG4gIHJldHVybjtcbn1cblxudmFyIGdsb2JhbEVsbSA9IHRoaXNbJ0VsbSddO1xuaWYgKHR5cGVvZiBnbG9iYWxFbG0gPT09IFwidW5kZWZpbmVkXCIpXG57XG4gIHRoaXNbJ0VsbSddID0gRWxtO1xuICByZXR1cm47XG59XG5cbmZvciAodmFyIHB1YmxpY01vZHVsZSBpbiBFbG0pXG57XG4gIGlmIChwdWJsaWNNb2R1bGUgaW4gZ2xvYmFsRWxtKVxuICB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGVyZSBhcmUgdHdvIEVsbSBtb2R1bGVzIGNhbGxlZCBgJyArIHB1YmxpY01vZHVsZSArICdgIG9uIHRoaXMgcGFnZSEgUmVuYW1lIG9uZSBvZiB0aGVtLicpO1xuICB9XG4gIGdsb2JhbEVsbVtwdWJsaWNNb2R1bGVdID0gRWxtW3B1YmxpY01vZHVsZV07XG59XG5cbn0pLmNhbGwodGhpcyk7XG5cbiIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG4gIChmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbi8qIGdsb2JhbHMgRWxtLCAkICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuZXctY2FwLCBuby11bmRlcnNjb3JlLWRhbmdsZSAqL1xuXG4oZnVuY3Rpb24gKCkge1xuICAvKipcbiAgICogSWYgaXQncyBub3QgYSBNYXliZSwgcmV0dXJucyB3aGF0ZXZlciB2YWx1ZSB0aGF0IGlzLCBpZiBpdCBpc1xuICAgKiBhIE1heWJlLCByZXR1cm5zIGB2YWx1ZWAgZm9yIGBKdXN0IHZhbHVlYCBhbmQgYG51bGxgIGZvciBgTm90aGluZ2BcbiAgICogQG1ldGhvZCBmcm9tTWF5YmVcbiAgICogQHBhcmFtICB7T2JqZWN0PEFueT4gfCBBbnkgfSB2YWxcbiAgICogQHJldHVybiB7QW55fVxuICAgKi9cbiAgdmFyIGZyb21NYXliZSA9IGZ1bmN0aW9uIGZyb21NYXliZSh2YWwpIHtcbiAgICB2YXIgaXNNYXliZSA9IHZhbCAmJiB2YWwuY3RvcjtcblxuICAgIGlmICghaXNNYXliZSkge1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsLl8wID8gdmFsLl8wIDogbnVsbDtcbiAgfTtcblxuICB2YXIgcGFyc2VFbG1MaXN0ID0gZnVuY3Rpb24gcGFyc2VFbG1MaXN0KGwpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShsKSkge1xuICAgICAgcmV0dXJuIGw7XG4gICAgfVxuXG4gICAgdmFyIGxpc3QgPSBbXTtcbiAgICB2YXIgY291bnRlciA9IDA7XG4gICAgdmFyIGtleSA9ICdfJyArIGNvdW50ZXI7XG4gICAgd2hpbGUgKGxba2V5XSAhPT0gdW5kZWZpbmVkICYmIGxba2V5XS5jdG9yICE9PSAnW10nKSB7XG4gICAgICBsaXN0ID0gbGlzdC5jb25jYXQobFtrZXldKTtcbiAgICAgIGNvdW50ZXIgPSBjb3VudGVyICsgMTtcbiAgICAgIGtleSA9ICdfJyArIGNvdW50ZXI7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpc3Q7XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gRWxtIGFjY2VwdGFibGUgTW9kYWwgb2JqZWN0XG4gICAqIEBtZXRob2QgTW9kYWxcbiAgICogQHBhcmFtICB7U3RyaW5nfSBzZWxlY3RvclxuICAgKiBAcGFyYW0gIHtTdHJpbmcgfCBNYXliZSBTdHJpbmd9IHRhcmdldFVybFxuICAgKi9cbiAgdmFyIE1vZGFsID0gZnVuY3Rpb24gTW9kYWwoKSB7XG4gICAgdmFyIF9yZWYgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuXG4gICAgdmFyIHNlbGVjdG9yID0gX3JlZi5zZWxlY3RvcjtcbiAgICB2YXIgdGFyZ2V0VXJsID0gX3JlZi50YXJnZXRVcmw7XG5cbiAgICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgICAvLyBJdCB3YXMgbm90IHNldCBieSBFbG1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciB1cmwgPSBmcm9tTWF5YmUodGFyZ2V0VXJsKTtcbiAgICByZXR1cm4geyBzZWxlY3Rvcjogc2VsZWN0b3IsIHRhcmdldFVybDogdXJsIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gRWxtIGFjY2VwdGFibGUgSGlzdG9yeVN0YXRlIG9iamVjdFxuICAgKiBUaGlzIGlzIHVzZWQgdG8gbWFrZSB0aGUgbGluayBFbG0tSlMgYW5kIEpTLUVsbVxuICAgKiBAbWV0aG9kIEhpc3RvcnlTdGF0ZVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHVybFxuICAgKiBAcGFyYW0gIHtBcnJheTxNb2RhbD59XG4gICAqL1xuICB2YXIgSGlzdG9yeVN0YXRlID0gZnVuY3Rpb24gSGlzdG9yeVN0YXRlKHN0YXRlKSB7XG4gICAgdmFyIF9yZWYyID0gc3RhdGUgfHwge307XG5cbiAgICB2YXIgdXJsID0gX3JlZjIudXJsO1xuICAgIHZhciBvcGVuTW9kYWxzID0gX3JlZjIub3Blbk1vZGFscztcbiAgICB2YXIgc2Vzc2lvbklkID0gX3JlZjIuc2Vzc2lvbklkO1xuXG4gICAgaWYgKCF1cmwpIHtcbiAgICAgIC8vIEl0IHdhcyBub3Qgc2V0IGJ5IEVsbVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIG1vZGFscyA9IHBhcnNlRWxtTGlzdChvcGVuTW9kYWxzKS5tYXAoTW9kYWwpO1xuICAgIG1vZGFscy5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICBpZiAoIW0pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIG51bGwgbW9kYWwgd2FzIGZvdW5kIGluIGEgaGlzdG9yeSBzdGF0ZS4gJyArICgnU29tZXRoaW5nIGlzIHdyb25nLiBIZXJlIGFyZSBhbGwgdGhlIG1vZGFscyAnICsgSlNPTi5zdHJpbmdpZnkobW9kYWxzKSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7IHVybDogdXJsLCBzZXNzaW9uSWQ6IHNlc3Npb25JZCwgb3Blbk1vZGFsczogbW9kYWxzIH07XG4gIH07XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAvLyBXZSB3aWxsIHByb3ZpZGUgYSB1bmlxdWUgaWQgZm9yIG91ciBhcHBcbiAgdmFyIHNlc3Npb25JZCA9IERhdGUubm93KCk7XG4gIHZhciBhcHAgPSBFbG0uTW9kYWxSb3V0ZXIuZnVsbHNjcmVlbihzZXNzaW9uSWQpO1xuXG4gIC8vIFdlIHNlbmQgc3R1ZmYgdG8gRWxtIHdpdGggc3VnZ2VzdGlvbnNcbiAgdmFyIF9hcHAkcG9ydHMgPSBhcHAucG9ydHM7XG4gIHZhciBvblBvcFN0YXRlID0gX2FwcCRwb3J0cy5vblBvcFN0YXRlO1xuICB2YXIgb25Nb2RhbE9wZW4gPSBfYXBwJHBvcnRzLm9uTW9kYWxPcGVuO1xuICB2YXIgb25Nb2RhbENsb3NlID0gX2FwcCRwb3J0cy5vbk1vZGFsQ2xvc2U7XG5cblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBoaXN0U3RhdGUgPSBIaXN0b3J5U3RhdGUoZS5zdGF0ZSk7XG4gICAgb25Qb3BTdGF0ZS5zZW5kKGhpc3RTdGF0ZSk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGdldE1vZGFsSW5mbyhlKSB7XG4gICAgdmFyIHRhcmdldFVybCA9IGUucmVsYXRlZFRhcmdldCAmJiBlLnJlbGF0ZWRUYXJnZXQuZ2V0QXR0cmlidXRlKCdocmVmJykgPyBlLnJlbGF0ZWRUYXJnZXQuZ2V0QXR0cmlidXRlKCdocmVmJykgOiBudWxsO1xuXG4gICAgdmFyIHNlbGVjdG9yID0gJyMnICsgZS50YXJnZXQuaWQ7XG4gICAgdmFyIG1vZGFsSW5mbyA9IE1vZGFsKHsgc2VsZWN0b3I6IHNlbGVjdG9yLCB0YXJnZXRVcmw6IHRhcmdldFVybCB9KTtcbiAgICByZXR1cm4gbW9kYWxJbmZvO1xuICB9XG5cbiAgJChkb2N1bWVudC5ib2R5KS5vbignc2hvdy5icy5tb2RhbCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgcmV0dXJuIG9uTW9kYWxPcGVuLnNlbmQoZ2V0TW9kYWxJbmZvKGUpKTtcbiAgfSkub24oJ2hpZGUuYnMubW9kYWwnLCBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBtb2RhbCA9IGdldE1vZGFsSW5mbyhlKTtcbiAgICBpZiAoIW1vZGFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01vZGFsIGNsb3NlIGV2ZW50IGRpZCBub3QgY29udGFpbiBhIG1vZGFsLiBTb21ldGhpbmcgaXMgd3JvbmcuJyk7XG4gICAgfVxuICAgIG9uTW9kYWxDbG9zZS5zZW5kKG1vZGFsLnNlbGVjdG9yKTtcbiAgfSk7XG5cbiAgYXBwLnBvcnRzLnJlbG9hZC5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgfSk7XG59KSgpO1xuXG59KSkpO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1wb3J0cy5qcy5tYXBcbiJdfQ==
