
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


/* globals Elm, $ */
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

// =============================================================================

// We will provide a unique id for our app
const sessionId = Date.now();
const app = Elm.ModalRouter.fullscreen(sessionId);

// We send stuff to Elm with suggestions
const {
  onPopState,
  onModalOpen,
  onModalClose,
} = app.ports;

window.addEventListener('popstate', (e) => {
  const histState = HistoryState(e.state);
  onPopState.send(histState);
});

function getModalInfo(e) {
  const targetUrl = e.relatedTarget && e.relatedTarget.getAttribute('href')
      ? e.relatedTarget.getAttribute('href')
      : null;

  const selector = `#${e.target.id}`;
  const modalInfo = Modal({ selector, targetUrl });
  return modalInfo;
}

$(document.body)
  .on('show.bs.modal', (e) => onModalOpen.send(getModalInfo(e)))
  .on('hide.bs.modal', (e) => {
    const modal = getModalInfo(e);
    if (!modal) {
      throw new Error('Modal close event did not contain a modal. Something is wrong.');
    }
    onModalClose.send(modal.selector);
  });

app.ports.reload.subscribe(() => {
  window.location.reload();
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LWVsbS5qcyIsInBvcnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6OFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZmwtbW9kYWwtcm91dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4oZnVuY3Rpb24oKSB7XG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIEYyKGZ1bilcbntcbiAgZnVuY3Rpb24gd3JhcHBlcihhKSB7IHJldHVybiBmdW5jdGlvbihiKSB7IHJldHVybiBmdW4oYSxiKTsgfTsgfVxuICB3cmFwcGVyLmFyaXR5ID0gMjtcbiAgd3JhcHBlci5mdW5jID0gZnVuO1xuICByZXR1cm4gd3JhcHBlcjtcbn1cblxuZnVuY3Rpb24gRjMoZnVuKVxue1xuICBmdW5jdGlvbiB3cmFwcGVyKGEpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYikgeyByZXR1cm4gZnVuY3Rpb24oYykgeyByZXR1cm4gZnVuKGEsIGIsIGMpOyB9OyB9O1xuICB9XG4gIHdyYXBwZXIuYXJpdHkgPSAzO1xuICB3cmFwcGVyLmZ1bmMgPSBmdW47XG4gIHJldHVybiB3cmFwcGVyO1xufVxuXG5mdW5jdGlvbiBGNChmdW4pXG57XG4gIGZ1bmN0aW9uIHdyYXBwZXIoYSkgeyByZXR1cm4gZnVuY3Rpb24oYikgeyByZXR1cm4gZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBmdW5jdGlvbihkKSB7IHJldHVybiBmdW4oYSwgYiwgYywgZCk7IH07IH07IH07XG4gIH1cbiAgd3JhcHBlci5hcml0eSA9IDQ7XG4gIHdyYXBwZXIuZnVuYyA9IGZ1bjtcbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmZ1bmN0aW9uIEY1KGZ1bilcbntcbiAgZnVuY3Rpb24gd3JhcHBlcihhKSB7IHJldHVybiBmdW5jdGlvbihiKSB7IHJldHVybiBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGZ1bihhLCBiLCBjLCBkLCBlKTsgfTsgfTsgfTsgfTtcbiAgfVxuICB3cmFwcGVyLmFyaXR5ID0gNTtcbiAgd3JhcHBlci5mdW5jID0gZnVuO1xuICByZXR1cm4gd3JhcHBlcjtcbn1cblxuZnVuY3Rpb24gRjYoZnVuKVxue1xuICBmdW5jdGlvbiB3cmFwcGVyKGEpIHsgcmV0dXJuIGZ1bmN0aW9uKGIpIHsgcmV0dXJuIGZ1bmN0aW9uKGMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZCkgeyByZXR1cm4gZnVuY3Rpb24oZSkgeyByZXR1cm4gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiBmdW4oYSwgYiwgYywgZCwgZSwgZik7IH07IH07IH07IH07IH07XG4gIH1cbiAgd3JhcHBlci5hcml0eSA9IDY7XG4gIHdyYXBwZXIuZnVuYyA9IGZ1bjtcbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmZ1bmN0aW9uIEY3KGZ1bilcbntcbiAgZnVuY3Rpb24gd3JhcHBlcihhKSB7IHJldHVybiBmdW5jdGlvbihiKSB7IHJldHVybiBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGZ1bmN0aW9uKGUpIHsgcmV0dXJuIGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZykgeyByZXR1cm4gZnVuKGEsIGIsIGMsIGQsIGUsIGYsIGcpOyB9OyB9OyB9OyB9OyB9OyB9O1xuICB9XG4gIHdyYXBwZXIuYXJpdHkgPSA3O1xuICB3cmFwcGVyLmZ1bmMgPSBmdW47XG4gIHJldHVybiB3cmFwcGVyO1xufVxuXG5mdW5jdGlvbiBGOChmdW4pXG57XG4gIGZ1bmN0aW9uIHdyYXBwZXIoYSkgeyByZXR1cm4gZnVuY3Rpb24oYikgeyByZXR1cm4gZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBmdW5jdGlvbihkKSB7IHJldHVybiBmdW5jdGlvbihlKSB7IHJldHVybiBmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGcpIHsgcmV0dXJuIGZ1bmN0aW9uKGgpIHtcbiAgICByZXR1cm4gZnVuKGEsIGIsIGMsIGQsIGUsIGYsIGcsIGgpOyB9OyB9OyB9OyB9OyB9OyB9OyB9O1xuICB9XG4gIHdyYXBwZXIuYXJpdHkgPSA4O1xuICB3cmFwcGVyLmZ1bmMgPSBmdW47XG4gIHJldHVybiB3cmFwcGVyO1xufVxuXG5mdW5jdGlvbiBGOShmdW4pXG57XG4gIGZ1bmN0aW9uIHdyYXBwZXIoYSkgeyByZXR1cm4gZnVuY3Rpb24oYikgeyByZXR1cm4gZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBmdW5jdGlvbihkKSB7IHJldHVybiBmdW5jdGlvbihlKSB7IHJldHVybiBmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGcpIHsgcmV0dXJuIGZ1bmN0aW9uKGgpIHsgcmV0dXJuIGZ1bmN0aW9uKGkpIHtcbiAgICByZXR1cm4gZnVuKGEsIGIsIGMsIGQsIGUsIGYsIGcsIGgsIGkpOyB9OyB9OyB9OyB9OyB9OyB9OyB9OyB9O1xuICB9XG4gIHdyYXBwZXIuYXJpdHkgPSA5O1xuICB3cmFwcGVyLmZ1bmMgPSBmdW47XG4gIHJldHVybiB3cmFwcGVyO1xufVxuXG5mdW5jdGlvbiBBMihmdW4sIGEsIGIpXG57XG4gIHJldHVybiBmdW4uYXJpdHkgPT09IDJcbiAgICA/IGZ1bi5mdW5jKGEsIGIpXG4gICAgOiBmdW4oYSkoYik7XG59XG5mdW5jdGlvbiBBMyhmdW4sIGEsIGIsIGMpXG57XG4gIHJldHVybiBmdW4uYXJpdHkgPT09IDNcbiAgICA/IGZ1bi5mdW5jKGEsIGIsIGMpXG4gICAgOiBmdW4oYSkoYikoYyk7XG59XG5mdW5jdGlvbiBBNChmdW4sIGEsIGIsIGMsIGQpXG57XG4gIHJldHVybiBmdW4uYXJpdHkgPT09IDRcbiAgICA/IGZ1bi5mdW5jKGEsIGIsIGMsIGQpXG4gICAgOiBmdW4oYSkoYikoYykoZCk7XG59XG5mdW5jdGlvbiBBNShmdW4sIGEsIGIsIGMsIGQsIGUpXG57XG4gIHJldHVybiBmdW4uYXJpdHkgPT09IDVcbiAgICA/IGZ1bi5mdW5jKGEsIGIsIGMsIGQsIGUpXG4gICAgOiBmdW4oYSkoYikoYykoZCkoZSk7XG59XG5mdW5jdGlvbiBBNihmdW4sIGEsIGIsIGMsIGQsIGUsIGYpXG57XG4gIHJldHVybiBmdW4uYXJpdHkgPT09IDZcbiAgICA/IGZ1bi5mdW5jKGEsIGIsIGMsIGQsIGUsIGYpXG4gICAgOiBmdW4oYSkoYikoYykoZCkoZSkoZik7XG59XG5mdW5jdGlvbiBBNyhmdW4sIGEsIGIsIGMsIGQsIGUsIGYsIGcpXG57XG4gIHJldHVybiBmdW4uYXJpdHkgPT09IDdcbiAgICA/IGZ1bi5mdW5jKGEsIGIsIGMsIGQsIGUsIGYsIGcpXG4gICAgOiBmdW4oYSkoYikoYykoZCkoZSkoZikoZyk7XG59XG5mdW5jdGlvbiBBOChmdW4sIGEsIGIsIGMsIGQsIGUsIGYsIGcsIGgpXG57XG4gIHJldHVybiBmdW4uYXJpdHkgPT09IDhcbiAgICA/IGZ1bi5mdW5jKGEsIGIsIGMsIGQsIGUsIGYsIGcsIGgpXG4gICAgOiBmdW4oYSkoYikoYykoZCkoZSkoZikoZykoaCk7XG59XG5mdW5jdGlvbiBBOShmdW4sIGEsIGIsIGMsIGQsIGUsIGYsIGcsIGgsIGkpXG57XG4gIHJldHVybiBmdW4uYXJpdHkgPT09IDlcbiAgICA/IGZ1bi5mdW5jKGEsIGIsIGMsIGQsIGUsIGYsIGcsIGgsIGkpXG4gICAgOiBmdW4oYSkoYikoYykoZCkoZSkoZikoZykoaCkoaSk7XG59XG5cbi8vaW1wb3J0IE5hdGl2ZS5MaXN0IC8vXG5cbnZhciBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkgPSBmdW5jdGlvbigpIHtcblxuLy8gQSBSUkItVHJlZSBoYXMgdHdvIGRpc3RpbmN0IGRhdGEgdHlwZXMuXG4vLyBMZWFmIC0+IFwiaGVpZ2h0XCIgIGlzIGFsd2F5cyAwXG4vLyAgICAgICAgIFwidGFibGVcIiAgIGlzIGFuIGFycmF5IG9mIGVsZW1lbnRzXG4vLyBOb2RlIC0+IFwiaGVpZ2h0XCIgIGlzIGFsd2F5cyBncmVhdGVyIHRoYW4gMFxuLy8gICAgICAgICBcInRhYmxlXCIgICBpcyBhbiBhcnJheSBvZiBjaGlsZCBub2Rlc1xuLy8gICAgICAgICBcImxlbmd0aHNcIiBpcyBhbiBhcnJheSBvZiBhY2N1bXVsYXRlZCBsZW5ndGhzIG9mIHRoZSBjaGlsZCBub2Rlc1xuXG4vLyBNIGlzIHRoZSBtYXhpbWFsIHRhYmxlIHNpemUuIDMyIHNlZW1zIGZhc3QuIEUgaXMgdGhlIGFsbG93ZWQgaW5jcmVhc2Vcbi8vIG9mIHNlYXJjaCBzdGVwcyB3aGVuIGNvbmNhdHRpbmcgdG8gZmluZCBhbiBpbmRleC4gTG93ZXIgdmFsdWVzIHdpbGxcbi8vIGRlY3JlYXNlIGJhbGFuY2luZywgYnV0IHdpbGwgaW5jcmVhc2Ugc2VhcmNoIHN0ZXBzLlxudmFyIE0gPSAzMjtcbnZhciBFID0gMjtcblxuLy8gQW4gZW1wdHkgYXJyYXkuXG52YXIgZW1wdHkgPSB7XG5cdGN0b3I6ICdfQXJyYXknLFxuXHRoZWlnaHQ6IDAsXG5cdHRhYmxlOiBbXVxufTtcblxuXG5mdW5jdGlvbiBnZXQoaSwgYXJyYXkpXG57XG5cdGlmIChpIDwgMCB8fCBpID49IGxlbmd0aChhcnJheSkpXG5cdHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHQnSW5kZXggJyArIGkgKyAnIGlzIG91dCBvZiByYW5nZS4gQ2hlY2sgdGhlIGxlbmd0aCBvZiAnICtcblx0XHRcdCd5b3VyIGFycmF5IGZpcnN0IG9yIHVzZSBnZXRNYXliZSBvciBnZXRXaXRoRGVmYXVsdC4nKTtcblx0fVxuXHRyZXR1cm4gdW5zYWZlR2V0KGksIGFycmF5KTtcbn1cblxuXG5mdW5jdGlvbiB1bnNhZmVHZXQoaSwgYXJyYXkpXG57XG5cdGZvciAodmFyIHggPSBhcnJheS5oZWlnaHQ7IHggPiAwOyB4LS0pXG5cdHtcblx0XHR2YXIgc2xvdCA9IGkgPj4gKHggKiA1KTtcblx0XHR3aGlsZSAoYXJyYXkubGVuZ3Roc1tzbG90XSA8PSBpKVxuXHRcdHtcblx0XHRcdHNsb3QrKztcblx0XHR9XG5cdFx0aWYgKHNsb3QgPiAwKVxuXHRcdHtcblx0XHRcdGkgLT0gYXJyYXkubGVuZ3Roc1tzbG90IC0gMV07XG5cdFx0fVxuXHRcdGFycmF5ID0gYXJyYXkudGFibGVbc2xvdF07XG5cdH1cblx0cmV0dXJuIGFycmF5LnRhYmxlW2ldO1xufVxuXG5cbi8vIFNldHMgdGhlIHZhbHVlIGF0IHRoZSBpbmRleCBpLiBPbmx5IHRoZSBub2RlcyBsZWFkaW5nIHRvIGkgd2lsbCBnZXRcbi8vIGNvcGllZCBhbmQgdXBkYXRlZC5cbmZ1bmN0aW9uIHNldChpLCBpdGVtLCBhcnJheSlcbntcblx0aWYgKGkgPCAwIHx8IGxlbmd0aChhcnJheSkgPD0gaSlcblx0e1xuXHRcdHJldHVybiBhcnJheTtcblx0fVxuXHRyZXR1cm4gdW5zYWZlU2V0KGksIGl0ZW0sIGFycmF5KTtcbn1cblxuXG5mdW5jdGlvbiB1bnNhZmVTZXQoaSwgaXRlbSwgYXJyYXkpXG57XG5cdGFycmF5ID0gbm9kZUNvcHkoYXJyYXkpO1xuXG5cdGlmIChhcnJheS5oZWlnaHQgPT09IDApXG5cdHtcblx0XHRhcnJheS50YWJsZVtpXSA9IGl0ZW07XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0dmFyIHNsb3QgPSBnZXRTbG90KGksIGFycmF5KTtcblx0XHRpZiAoc2xvdCA+IDApXG5cdFx0e1xuXHRcdFx0aSAtPSBhcnJheS5sZW5ndGhzW3Nsb3QgLSAxXTtcblx0XHR9XG5cdFx0YXJyYXkudGFibGVbc2xvdF0gPSB1bnNhZmVTZXQoaSwgaXRlbSwgYXJyYXkudGFibGVbc2xvdF0pO1xuXHR9XG5cdHJldHVybiBhcnJheTtcbn1cblxuXG5mdW5jdGlvbiBpbml0aWFsaXplKGxlbiwgZilcbntcblx0aWYgKGxlbiA8PSAwKVxuXHR7XG5cdFx0cmV0dXJuIGVtcHR5O1xuXHR9XG5cdHZhciBoID0gTWF0aC5mbG9vciggTWF0aC5sb2cobGVuKSAvIE1hdGgubG9nKE0pICk7XG5cdHJldHVybiBpbml0aWFsaXplXyhmLCBoLCAwLCBsZW4pO1xufVxuXG5mdW5jdGlvbiBpbml0aWFsaXplXyhmLCBoLCBmcm9tLCB0bylcbntcblx0aWYgKGggPT09IDApXG5cdHtcblx0XHR2YXIgdGFibGUgPSBuZXcgQXJyYXkoKHRvIC0gZnJvbSkgJSAoTSArIDEpKTtcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRhYmxlLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHQgIHRhYmxlW2ldID0gZihmcm9tICsgaSk7XG5cdFx0fVxuXHRcdHJldHVybiB7XG5cdFx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRcdGhlaWdodDogMCxcblx0XHRcdHRhYmxlOiB0YWJsZVxuXHRcdH07XG5cdH1cblxuXHR2YXIgc3RlcCA9IE1hdGgucG93KE0sIGgpO1xuXHR2YXIgdGFibGUgPSBuZXcgQXJyYXkoTWF0aC5jZWlsKCh0byAtIGZyb20pIC8gc3RlcCkpO1xuXHR2YXIgbGVuZ3RocyA9IG5ldyBBcnJheSh0YWJsZS5sZW5ndGgpO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IHRhYmxlLmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0dGFibGVbaV0gPSBpbml0aWFsaXplXyhmLCBoIC0gMSwgZnJvbSArIChpICogc3RlcCksIE1hdGgubWluKGZyb20gKyAoKGkgKyAxKSAqIHN0ZXApLCB0bykpO1xuXHRcdGxlbmd0aHNbaV0gPSBsZW5ndGgodGFibGVbaV0pICsgKGkgPiAwID8gbGVuZ3Roc1tpLTFdIDogMCk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRoZWlnaHQ6IGgsXG5cdFx0dGFibGU6IHRhYmxlLFxuXHRcdGxlbmd0aHM6IGxlbmd0aHNcblx0fTtcbn1cblxuZnVuY3Rpb24gZnJvbUxpc3QobGlzdClcbntcblx0aWYgKGxpc3QuY3RvciA9PT0gJ1tdJylcblx0e1xuXHRcdHJldHVybiBlbXB0eTtcblx0fVxuXG5cdC8vIEFsbG9jYXRlIE0gc2l6ZWQgYmxvY2tzICh0YWJsZSkgYW5kIHdyaXRlIGxpc3QgZWxlbWVudHMgdG8gaXQuXG5cdHZhciB0YWJsZSA9IG5ldyBBcnJheShNKTtcblx0dmFyIG5vZGVzID0gW107XG5cdHZhciBpID0gMDtcblxuXHR3aGlsZSAobGlzdC5jdG9yICE9PSAnW10nKVxuXHR7XG5cdFx0dGFibGVbaV0gPSBsaXN0Ll8wO1xuXHRcdGxpc3QgPSBsaXN0Ll8xO1xuXHRcdGkrKztcblxuXHRcdC8vIHRhYmxlIGlzIGZ1bGwsIHNvIHdlIGNhbiBwdXNoIGEgbGVhZiBjb250YWluaW5nIGl0IGludG8gdGhlXG5cdFx0Ly8gbmV4dCBub2RlLlxuXHRcdGlmIChpID09PSBNKVxuXHRcdHtcblx0XHRcdHZhciBsZWFmID0ge1xuXHRcdFx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRcdFx0aGVpZ2h0OiAwLFxuXHRcdFx0XHR0YWJsZTogdGFibGVcblx0XHRcdH07XG5cdFx0XHRmcm9tTGlzdFB1c2gobGVhZiwgbm9kZXMpO1xuXHRcdFx0dGFibGUgPSBuZXcgQXJyYXkoTSk7XG5cdFx0XHRpID0gMDtcblx0XHR9XG5cdH1cblxuXHQvLyBNYXliZSB0aGVyZSBpcyBzb21ldGhpbmcgbGVmdCBvbiB0aGUgdGFibGUuXG5cdGlmIChpID4gMClcblx0e1xuXHRcdHZhciBsZWFmID0ge1xuXHRcdFx0Y3RvcjogJ19BcnJheScsXG5cdFx0XHRoZWlnaHQ6IDAsXG5cdFx0XHR0YWJsZTogdGFibGUuc3BsaWNlKDAsIGkpXG5cdFx0fTtcblx0XHRmcm9tTGlzdFB1c2gobGVhZiwgbm9kZXMpO1xuXHR9XG5cblx0Ly8gR28gdGhyb3VnaCBhbGwgb2YgdGhlIG5vZGVzIGFuZCBldmVudHVhbGx5IHB1c2ggdGhlbSBpbnRvIGhpZ2hlciBub2Rlcy5cblx0Zm9yICh2YXIgaCA9IDA7IGggPCBub2Rlcy5sZW5ndGggLSAxOyBoKyspXG5cdHtcblx0XHRpZiAobm9kZXNbaF0udGFibGUubGVuZ3RoID4gMClcblx0XHR7XG5cdFx0XHRmcm9tTGlzdFB1c2gobm9kZXNbaF0sIG5vZGVzKTtcblx0XHR9XG5cdH1cblxuXHR2YXIgaGVhZCA9IG5vZGVzW25vZGVzLmxlbmd0aCAtIDFdO1xuXHRpZiAoaGVhZC5oZWlnaHQgPiAwICYmIGhlYWQudGFibGUubGVuZ3RoID09PSAxKVxuXHR7XG5cdFx0cmV0dXJuIGhlYWQudGFibGVbMF07XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0cmV0dXJuIGhlYWQ7XG5cdH1cbn1cblxuLy8gUHVzaCBhIG5vZGUgaW50byBhIGhpZ2hlciBub2RlIGFzIGEgY2hpbGQuXG5mdW5jdGlvbiBmcm9tTGlzdFB1c2godG9QdXNoLCBub2Rlcylcbntcblx0dmFyIGggPSB0b1B1c2guaGVpZ2h0O1xuXG5cdC8vIE1heWJlIHRoZSBub2RlIG9uIHRoaXMgaGVpZ2h0IGRvZXMgbm90IGV4aXN0LlxuXHRpZiAobm9kZXMubGVuZ3RoID09PSBoKVxuXHR7XG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRcdGhlaWdodDogaCArIDEsXG5cdFx0XHR0YWJsZTogW10sXG5cdFx0XHRsZW5ndGhzOiBbXVxuXHRcdH07XG5cdFx0bm9kZXMucHVzaChub2RlKTtcblx0fVxuXG5cdG5vZGVzW2hdLnRhYmxlLnB1c2godG9QdXNoKTtcblx0dmFyIGxlbiA9IGxlbmd0aCh0b1B1c2gpO1xuXHRpZiAobm9kZXNbaF0ubGVuZ3Rocy5sZW5ndGggPiAwKVxuXHR7XG5cdFx0bGVuICs9IG5vZGVzW2hdLmxlbmd0aHNbbm9kZXNbaF0ubGVuZ3Rocy5sZW5ndGggLSAxXTtcblx0fVxuXHRub2Rlc1toXS5sZW5ndGhzLnB1c2gobGVuKTtcblxuXHRpZiAobm9kZXNbaF0udGFibGUubGVuZ3RoID09PSBNKVxuXHR7XG5cdFx0ZnJvbUxpc3RQdXNoKG5vZGVzW2hdLCBub2Rlcyk7XG5cdFx0bm9kZXNbaF0gPSB7XG5cdFx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRcdGhlaWdodDogaCArIDEsXG5cdFx0XHR0YWJsZTogW10sXG5cdFx0XHRsZW5ndGhzOiBbXVxuXHRcdH07XG5cdH1cbn1cblxuLy8gUHVzaGVzIGFuIGl0ZW0gdmlhIHB1c2hfIHRvIHRoZSBib3R0b20gcmlnaHQgb2YgYSB0cmVlLlxuZnVuY3Rpb24gcHVzaChpdGVtLCBhKVxue1xuXHR2YXIgcHVzaGVkID0gcHVzaF8oaXRlbSwgYSk7XG5cdGlmIChwdXNoZWQgIT09IG51bGwpXG5cdHtcblx0XHRyZXR1cm4gcHVzaGVkO1xuXHR9XG5cblx0dmFyIG5ld1RyZWUgPSBjcmVhdGUoaXRlbSwgYS5oZWlnaHQpO1xuXHRyZXR1cm4gc2libGlzZShhLCBuZXdUcmVlKTtcbn1cblxuLy8gUmVjdXJzaXZlbHkgdHJpZXMgdG8gcHVzaCBhbiBpdGVtIHRvIHRoZSBib3R0b20tcmlnaHQgbW9zdFxuLy8gdHJlZSBwb3NzaWJsZS4gSWYgdGhlcmUgaXMgbm8gc3BhY2UgbGVmdCBmb3IgdGhlIGl0ZW0sXG4vLyBudWxsIHdpbGwgYmUgcmV0dXJuZWQuXG5mdW5jdGlvbiBwdXNoXyhpdGVtLCBhKVxue1xuXHQvLyBIYW5kbGUgcmVzdXJzaW9uIHN0b3AgYXQgbGVhZiBsZXZlbC5cblx0aWYgKGEuaGVpZ2h0ID09PSAwKVxuXHR7XG5cdFx0aWYgKGEudGFibGUubGVuZ3RoIDwgTSlcblx0XHR7XG5cdFx0XHR2YXIgbmV3QSA9IHtcblx0XHRcdFx0Y3RvcjogJ19BcnJheScsXG5cdFx0XHRcdGhlaWdodDogMCxcblx0XHRcdFx0dGFibGU6IGEudGFibGUuc2xpY2UoKVxuXHRcdFx0fTtcblx0XHRcdG5ld0EudGFibGUucHVzaChpdGVtKTtcblx0XHRcdHJldHVybiBuZXdBO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdCAgcmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmVjdXJzaXZlbHkgcHVzaFxuXHR2YXIgcHVzaGVkID0gcHVzaF8oaXRlbSwgYm90UmlnaHQoYSkpO1xuXG5cdC8vIFRoZXJlIHdhcyBzcGFjZSBpbiB0aGUgYm90dG9tIHJpZ2h0IHRyZWUsIHNvIHRoZSBzbG90IHdpbGxcblx0Ly8gYmUgdXBkYXRlZC5cblx0aWYgKHB1c2hlZCAhPT0gbnVsbClcblx0e1xuXHRcdHZhciBuZXdBID0gbm9kZUNvcHkoYSk7XG5cdFx0bmV3QS50YWJsZVtuZXdBLnRhYmxlLmxlbmd0aCAtIDFdID0gcHVzaGVkO1xuXHRcdG5ld0EubGVuZ3Roc1tuZXdBLmxlbmd0aHMubGVuZ3RoIC0gMV0rKztcblx0XHRyZXR1cm4gbmV3QTtcblx0fVxuXG5cdC8vIFdoZW4gdGhlcmUgd2FzIG5vIHNwYWNlIGxlZnQsIGNoZWNrIGlmIHRoZXJlIGlzIHNwYWNlIGxlZnRcblx0Ly8gZm9yIGEgbmV3IHNsb3Qgd2l0aCBhIHRyZWUgd2hpY2ggY29udGFpbnMgb25seSB0aGUgaXRlbVxuXHQvLyBhdCB0aGUgYm90dG9tLlxuXHRpZiAoYS50YWJsZS5sZW5ndGggPCBNKVxuXHR7XG5cdFx0dmFyIG5ld1Nsb3QgPSBjcmVhdGUoaXRlbSwgYS5oZWlnaHQgLSAxKTtcblx0XHR2YXIgbmV3QSA9IG5vZGVDb3B5KGEpO1xuXHRcdG5ld0EudGFibGUucHVzaChuZXdTbG90KTtcblx0XHRuZXdBLmxlbmd0aHMucHVzaChuZXdBLmxlbmd0aHNbbmV3QS5sZW5ndGhzLmxlbmd0aCAtIDFdICsgbGVuZ3RoKG5ld1Nsb3QpKTtcblx0XHRyZXR1cm4gbmV3QTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxufVxuXG4vLyBDb252ZXJ0cyBhbiBhcnJheSBpbnRvIGEgbGlzdCBvZiBlbGVtZW50cy5cbmZ1bmN0aW9uIHRvTGlzdChhKVxue1xuXHRyZXR1cm4gdG9MaXN0XyhfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5OaWwsIGEpO1xufVxuXG5mdW5jdGlvbiB0b0xpc3RfKGxpc3QsIGEpXG57XG5cdGZvciAodmFyIGkgPSBhLnRhYmxlLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKVxuXHR7XG5cdFx0bGlzdCA9XG5cdFx0XHRhLmhlaWdodCA9PT0gMFxuXHRcdFx0XHQ/IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LkNvbnMoYS50YWJsZVtpXSwgbGlzdClcblx0XHRcdFx0OiB0b0xpc3RfKGxpc3QsIGEudGFibGVbaV0pO1xuXHR9XG5cdHJldHVybiBsaXN0O1xufVxuXG4vLyBNYXBzIGEgZnVuY3Rpb24gb3ZlciB0aGUgZWxlbWVudHMgb2YgYW4gYXJyYXkuXG5mdW5jdGlvbiBtYXAoZiwgYSlcbntcblx0dmFyIG5ld0EgPSB7XG5cdFx0Y3RvcjogJ19BcnJheScsXG5cdFx0aGVpZ2h0OiBhLmhlaWdodCxcblx0XHR0YWJsZTogbmV3IEFycmF5KGEudGFibGUubGVuZ3RoKVxuXHR9O1xuXHRpZiAoYS5oZWlnaHQgPiAwKVxuXHR7XG5cdFx0bmV3QS5sZW5ndGhzID0gYS5sZW5ndGhzO1xuXHR9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYS50YWJsZS5sZW5ndGg7IGkrKylcblx0e1xuXHRcdG5ld0EudGFibGVbaV0gPVxuXHRcdFx0YS5oZWlnaHQgPT09IDBcblx0XHRcdFx0PyBmKGEudGFibGVbaV0pXG5cdFx0XHRcdDogbWFwKGYsIGEudGFibGVbaV0pO1xuXHR9XG5cdHJldHVybiBuZXdBO1xufVxuXG4vLyBNYXBzIGEgZnVuY3Rpb24gb3ZlciB0aGUgZWxlbWVudHMgd2l0aCB0aGVpciBpbmRleCBhcyBmaXJzdCBhcmd1bWVudC5cbmZ1bmN0aW9uIGluZGV4ZWRNYXAoZiwgYSlcbntcblx0cmV0dXJuIGluZGV4ZWRNYXBfKGYsIGEsIDApO1xufVxuXG5mdW5jdGlvbiBpbmRleGVkTWFwXyhmLCBhLCBmcm9tKVxue1xuXHR2YXIgbmV3QSA9IHtcblx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRoZWlnaHQ6IGEuaGVpZ2h0LFxuXHRcdHRhYmxlOiBuZXcgQXJyYXkoYS50YWJsZS5sZW5ndGgpXG5cdH07XG5cdGlmIChhLmhlaWdodCA+IDApXG5cdHtcblx0XHRuZXdBLmxlbmd0aHMgPSBhLmxlbmd0aHM7XG5cdH1cblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhLnRhYmxlLmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0bmV3QS50YWJsZVtpXSA9XG5cdFx0XHRhLmhlaWdodCA9PT0gMFxuXHRcdFx0XHQ/IEEyKGYsIGZyb20gKyBpLCBhLnRhYmxlW2ldKVxuXHRcdFx0XHQ6IGluZGV4ZWRNYXBfKGYsIGEudGFibGVbaV0sIGkgPT0gMCA/IGZyb20gOiBmcm9tICsgYS5sZW5ndGhzW2kgLSAxXSk7XG5cdH1cblx0cmV0dXJuIG5ld0E7XG59XG5cbmZ1bmN0aW9uIGZvbGRsKGYsIGIsIGEpXG57XG5cdGlmIChhLmhlaWdodCA9PT0gMClcblx0e1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYS50YWJsZS5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRiID0gQTIoZiwgYS50YWJsZVtpXSwgYik7XG5cdFx0fVxuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYS50YWJsZS5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRiID0gZm9sZGwoZiwgYiwgYS50YWJsZVtpXSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBiO1xufVxuXG5mdW5jdGlvbiBmb2xkcihmLCBiLCBhKVxue1xuXHRpZiAoYS5oZWlnaHQgPT09IDApXG5cdHtcblx0XHRmb3IgKHZhciBpID0gYS50YWJsZS5sZW5ndGg7IGktLTsgKVxuXHRcdHtcblx0XHRcdGIgPSBBMihmLCBhLnRhYmxlW2ldLCBiKTtcblx0XHR9XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0Zm9yICh2YXIgaSA9IGEudGFibGUubGVuZ3RoOyBpLS07IClcblx0XHR7XG5cdFx0XHRiID0gZm9sZHIoZiwgYiwgYS50YWJsZVtpXSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBiO1xufVxuXG4vLyBUT0RPOiBjdXJyZW50bHksIGl0IHNsaWNlcyB0aGUgcmlnaHQsIHRoZW4gdGhlIGxlZnQuIFRoaXMgY2FuIGJlXG4vLyBvcHRpbWl6ZWQuXG5mdW5jdGlvbiBzbGljZShmcm9tLCB0bywgYSlcbntcblx0aWYgKGZyb20gPCAwKVxuXHR7XG5cdFx0ZnJvbSArPSBsZW5ndGgoYSk7XG5cdH1cblx0aWYgKHRvIDwgMClcblx0e1xuXHRcdHRvICs9IGxlbmd0aChhKTtcblx0fVxuXHRyZXR1cm4gc2xpY2VMZWZ0KGZyb20sIHNsaWNlUmlnaHQodG8sIGEpKTtcbn1cblxuZnVuY3Rpb24gc2xpY2VSaWdodCh0bywgYSlcbntcblx0aWYgKHRvID09PSBsZW5ndGgoYSkpXG5cdHtcblx0XHRyZXR1cm4gYTtcblx0fVxuXG5cdC8vIEhhbmRsZSBsZWFmIGxldmVsLlxuXHRpZiAoYS5oZWlnaHQgPT09IDApXG5cdHtcblx0XHR2YXIgbmV3QSA9IHsgY3RvcjonX0FycmF5JywgaGVpZ2h0OjAgfTtcblx0XHRuZXdBLnRhYmxlID0gYS50YWJsZS5zbGljZSgwLCB0byk7XG5cdFx0cmV0dXJuIG5ld0E7XG5cdH1cblxuXHQvLyBTbGljZSB0aGUgcmlnaHQgcmVjdXJzaXZlbHkuXG5cdHZhciByaWdodCA9IGdldFNsb3QodG8sIGEpO1xuXHR2YXIgc2xpY2VkID0gc2xpY2VSaWdodCh0byAtIChyaWdodCA+IDAgPyBhLmxlbmd0aHNbcmlnaHQgLSAxXSA6IDApLCBhLnRhYmxlW3JpZ2h0XSk7XG5cblx0Ly8gTWF5YmUgdGhlIGEgbm9kZSBpcyBub3QgZXZlbiBuZWVkZWQsIGFzIHNsaWNlZCBjb250YWlucyB0aGUgd2hvbGUgc2xpY2UuXG5cdGlmIChyaWdodCA9PT0gMClcblx0e1xuXHRcdHJldHVybiBzbGljZWQ7XG5cdH1cblxuXHQvLyBDcmVhdGUgbmV3IG5vZGUuXG5cdHZhciBuZXdBID0ge1xuXHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdGhlaWdodDogYS5oZWlnaHQsXG5cdFx0dGFibGU6IGEudGFibGUuc2xpY2UoMCwgcmlnaHQpLFxuXHRcdGxlbmd0aHM6IGEubGVuZ3Rocy5zbGljZSgwLCByaWdodClcblx0fTtcblx0aWYgKHNsaWNlZC50YWJsZS5sZW5ndGggPiAwKVxuXHR7XG5cdFx0bmV3QS50YWJsZVtyaWdodF0gPSBzbGljZWQ7XG5cdFx0bmV3QS5sZW5ndGhzW3JpZ2h0XSA9IGxlbmd0aChzbGljZWQpICsgKHJpZ2h0ID4gMCA/IG5ld0EubGVuZ3Roc1tyaWdodCAtIDFdIDogMCk7XG5cdH1cblx0cmV0dXJuIG5ld0E7XG59XG5cbmZ1bmN0aW9uIHNsaWNlTGVmdChmcm9tLCBhKVxue1xuXHRpZiAoZnJvbSA9PT0gMClcblx0e1xuXHRcdHJldHVybiBhO1xuXHR9XG5cblx0Ly8gSGFuZGxlIGxlYWYgbGV2ZWwuXG5cdGlmIChhLmhlaWdodCA9PT0gMClcblx0e1xuXHRcdHZhciBuZXdBID0geyBjdG9yOidfQXJyYXknLCBoZWlnaHQ6MCB9O1xuXHRcdG5ld0EudGFibGUgPSBhLnRhYmxlLnNsaWNlKGZyb20sIGEudGFibGUubGVuZ3RoICsgMSk7XG5cdFx0cmV0dXJuIG5ld0E7XG5cdH1cblxuXHQvLyBTbGljZSB0aGUgbGVmdCByZWN1cnNpdmVseS5cblx0dmFyIGxlZnQgPSBnZXRTbG90KGZyb20sIGEpO1xuXHR2YXIgc2xpY2VkID0gc2xpY2VMZWZ0KGZyb20gLSAobGVmdCA+IDAgPyBhLmxlbmd0aHNbbGVmdCAtIDFdIDogMCksIGEudGFibGVbbGVmdF0pO1xuXG5cdC8vIE1heWJlIHRoZSBhIG5vZGUgaXMgbm90IGV2ZW4gbmVlZGVkLCBhcyBzbGljZWQgY29udGFpbnMgdGhlIHdob2xlIHNsaWNlLlxuXHRpZiAobGVmdCA9PT0gYS50YWJsZS5sZW5ndGggLSAxKVxuXHR7XG5cdFx0cmV0dXJuIHNsaWNlZDtcblx0fVxuXG5cdC8vIENyZWF0ZSBuZXcgbm9kZS5cblx0dmFyIG5ld0EgPSB7XG5cdFx0Y3RvcjogJ19BcnJheScsXG5cdFx0aGVpZ2h0OiBhLmhlaWdodCxcblx0XHR0YWJsZTogYS50YWJsZS5zbGljZShsZWZ0LCBhLnRhYmxlLmxlbmd0aCArIDEpLFxuXHRcdGxlbmd0aHM6IG5ldyBBcnJheShhLnRhYmxlLmxlbmd0aCAtIGxlZnQpXG5cdH07XG5cdG5ld0EudGFibGVbMF0gPSBzbGljZWQ7XG5cdHZhciBsZW4gPSAwO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IG5ld0EudGFibGUubGVuZ3RoOyBpKyspXG5cdHtcblx0XHRsZW4gKz0gbGVuZ3RoKG5ld0EudGFibGVbaV0pO1xuXHRcdG5ld0EubGVuZ3Roc1tpXSA9IGxlbjtcblx0fVxuXG5cdHJldHVybiBuZXdBO1xufVxuXG4vLyBBcHBlbmRzIHR3byB0cmVlcy5cbmZ1bmN0aW9uIGFwcGVuZChhLGIpXG57XG5cdGlmIChhLnRhYmxlLmxlbmd0aCA9PT0gMClcblx0e1xuXHRcdHJldHVybiBiO1xuXHR9XG5cdGlmIChiLnRhYmxlLmxlbmd0aCA9PT0gMClcblx0e1xuXHRcdHJldHVybiBhO1xuXHR9XG5cblx0dmFyIGMgPSBhcHBlbmRfKGEsIGIpO1xuXG5cdC8vIENoZWNrIGlmIGJvdGggbm9kZXMgY2FuIGJlIGNydW5zaGVkIHRvZ2V0aGVyLlxuXHRpZiAoY1swXS50YWJsZS5sZW5ndGggKyBjWzFdLnRhYmxlLmxlbmd0aCA8PSBNKVxuXHR7XG5cdFx0aWYgKGNbMF0udGFibGUubGVuZ3RoID09PSAwKVxuXHRcdHtcblx0XHRcdHJldHVybiBjWzFdO1xuXHRcdH1cblx0XHRpZiAoY1sxXS50YWJsZS5sZW5ndGggPT09IDApXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGNbMF07XG5cdFx0fVxuXG5cdFx0Ly8gQWRqdXN0IC50YWJsZSBhbmQgLmxlbmd0aHNcblx0XHRjWzBdLnRhYmxlID0gY1swXS50YWJsZS5jb25jYXQoY1sxXS50YWJsZSk7XG5cdFx0aWYgKGNbMF0uaGVpZ2h0ID4gMClcblx0XHR7XG5cdFx0XHR2YXIgbGVuID0gbGVuZ3RoKGNbMF0pO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjWzFdLmxlbmd0aHMubGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdGNbMV0ubGVuZ3Roc1tpXSArPSBsZW47XG5cdFx0XHR9XG5cdFx0XHRjWzBdLmxlbmd0aHMgPSBjWzBdLmxlbmd0aHMuY29uY2F0KGNbMV0ubGVuZ3Rocyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNbMF07XG5cdH1cblxuXHRpZiAoY1swXS5oZWlnaHQgPiAwKVxuXHR7XG5cdFx0dmFyIHRvUmVtb3ZlID0gY2FsY1RvUmVtb3ZlKGEsIGIpO1xuXHRcdGlmICh0b1JlbW92ZSA+IEUpXG5cdFx0e1xuXHRcdFx0YyA9IHNodWZmbGUoY1swXSwgY1sxXSwgdG9SZW1vdmUpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzaWJsaXNlKGNbMF0sIGNbMV0pO1xufVxuXG4vLyBSZXR1cm5zIGFuIGFycmF5IG9mIHR3byBub2RlczsgcmlnaHQgYW5kIGxlZnQuIE9uZSBub2RlIF9tYXlfIGJlIGVtcHR5LlxuZnVuY3Rpb24gYXBwZW5kXyhhLCBiKVxue1xuXHRpZiAoYS5oZWlnaHQgPT09IDAgJiYgYi5oZWlnaHQgPT09IDApXG5cdHtcblx0XHRyZXR1cm4gW2EsIGJdO1xuXHR9XG5cblx0aWYgKGEuaGVpZ2h0ICE9PSAxIHx8IGIuaGVpZ2h0ICE9PSAxKVxuXHR7XG5cdFx0aWYgKGEuaGVpZ2h0ID09PSBiLmhlaWdodClcblx0XHR7XG5cdFx0XHRhID0gbm9kZUNvcHkoYSk7XG5cdFx0XHRiID0gbm9kZUNvcHkoYik7XG5cdFx0XHR2YXIgYXBwZW5kZWQgPSBhcHBlbmRfKGJvdFJpZ2h0KGEpLCBib3RMZWZ0KGIpKTtcblxuXHRcdFx0aW5zZXJ0UmlnaHQoYSwgYXBwZW5kZWRbMV0pO1xuXHRcdFx0aW5zZXJ0TGVmdChiLCBhcHBlbmRlZFswXSk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGEuaGVpZ2h0ID4gYi5oZWlnaHQpXG5cdFx0e1xuXHRcdFx0YSA9IG5vZGVDb3B5KGEpO1xuXHRcdFx0dmFyIGFwcGVuZGVkID0gYXBwZW5kXyhib3RSaWdodChhKSwgYik7XG5cblx0XHRcdGluc2VydFJpZ2h0KGEsIGFwcGVuZGVkWzBdKTtcblx0XHRcdGIgPSBwYXJlbnRpc2UoYXBwZW5kZWRbMV0sIGFwcGVuZGVkWzFdLmhlaWdodCArIDEpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0YiA9IG5vZGVDb3B5KGIpO1xuXHRcdFx0dmFyIGFwcGVuZGVkID0gYXBwZW5kXyhhLCBib3RMZWZ0KGIpKTtcblxuXHRcdFx0dmFyIGxlZnQgPSBhcHBlbmRlZFswXS50YWJsZS5sZW5ndGggPT09IDAgPyAwIDogMTtcblx0XHRcdHZhciByaWdodCA9IGxlZnQgPT09IDAgPyAxIDogMDtcblx0XHRcdGluc2VydExlZnQoYiwgYXBwZW5kZWRbbGVmdF0pO1xuXHRcdFx0YSA9IHBhcmVudGlzZShhcHBlbmRlZFtyaWdodF0sIGFwcGVuZGVkW3JpZ2h0XS5oZWlnaHQgKyAxKTtcblx0XHR9XG5cdH1cblxuXHQvLyBDaGVjayBpZiBiYWxhbmNpbmcgaXMgbmVlZGVkIGFuZCByZXR1cm4gYmFzZWQgb24gdGhhdC5cblx0aWYgKGEudGFibGUubGVuZ3RoID09PSAwIHx8IGIudGFibGUubGVuZ3RoID09PSAwKVxuXHR7XG5cdFx0cmV0dXJuIFthLCBiXTtcblx0fVxuXG5cdHZhciB0b1JlbW92ZSA9IGNhbGNUb1JlbW92ZShhLCBiKTtcblx0aWYgKHRvUmVtb3ZlIDw9IEUpXG5cdHtcblx0XHRyZXR1cm4gW2EsIGJdO1xuXHR9XG5cdHJldHVybiBzaHVmZmxlKGEsIGIsIHRvUmVtb3ZlKTtcbn1cblxuLy8gSGVscGVyZnVuY3Rpb25zIGZvciBhcHBlbmRfLiBSZXBsYWNlcyBhIGNoaWxkIG5vZGUgYXQgdGhlIHNpZGUgb2YgdGhlIHBhcmVudC5cbmZ1bmN0aW9uIGluc2VydFJpZ2h0KHBhcmVudCwgbm9kZSlcbntcblx0dmFyIGluZGV4ID0gcGFyZW50LnRhYmxlLmxlbmd0aCAtIDE7XG5cdHBhcmVudC50YWJsZVtpbmRleF0gPSBub2RlO1xuXHRwYXJlbnQubGVuZ3Roc1tpbmRleF0gPSBsZW5ndGgobm9kZSk7XG5cdHBhcmVudC5sZW5ndGhzW2luZGV4XSArPSBpbmRleCA+IDAgPyBwYXJlbnQubGVuZ3Roc1tpbmRleCAtIDFdIDogMDtcbn1cblxuZnVuY3Rpb24gaW5zZXJ0TGVmdChwYXJlbnQsIG5vZGUpXG57XG5cdGlmIChub2RlLnRhYmxlLmxlbmd0aCA+IDApXG5cdHtcblx0XHRwYXJlbnQudGFibGVbMF0gPSBub2RlO1xuXHRcdHBhcmVudC5sZW5ndGhzWzBdID0gbGVuZ3RoKG5vZGUpO1xuXG5cdFx0dmFyIGxlbiA9IGxlbmd0aChwYXJlbnQudGFibGVbMF0pO1xuXHRcdGZvciAodmFyIGkgPSAxOyBpIDwgcGFyZW50Lmxlbmd0aHMubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0bGVuICs9IGxlbmd0aChwYXJlbnQudGFibGVbaV0pO1xuXHRcdFx0cGFyZW50Lmxlbmd0aHNbaV0gPSBsZW47XG5cdFx0fVxuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdHBhcmVudC50YWJsZS5zaGlmdCgpO1xuXHRcdGZvciAodmFyIGkgPSAxOyBpIDwgcGFyZW50Lmxlbmd0aHMubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0cGFyZW50Lmxlbmd0aHNbaV0gPSBwYXJlbnQubGVuZ3Roc1tpXSAtIHBhcmVudC5sZW5ndGhzWzBdO1xuXHRcdH1cblx0XHRwYXJlbnQubGVuZ3Rocy5zaGlmdCgpO1xuXHR9XG59XG5cbi8vIFJldHVybnMgdGhlIGV4dHJhIHNlYXJjaCBzdGVwcyBmb3IgRS4gUmVmZXIgdG8gdGhlIHBhcGVyLlxuZnVuY3Rpb24gY2FsY1RvUmVtb3ZlKGEsIGIpXG57XG5cdHZhciBzdWJMZW5ndGhzID0gMDtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhLnRhYmxlLmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0c3ViTGVuZ3RocyArPSBhLnRhYmxlW2ldLnRhYmxlLmxlbmd0aDtcblx0fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGIudGFibGUubGVuZ3RoOyBpKyspXG5cdHtcblx0XHRzdWJMZW5ndGhzICs9IGIudGFibGVbaV0udGFibGUubGVuZ3RoO1xuXHR9XG5cblx0dmFyIHRvUmVtb3ZlID0gYS50YWJsZS5sZW5ndGggKyBiLnRhYmxlLmxlbmd0aDtcblx0cmV0dXJuIHRvUmVtb3ZlIC0gKE1hdGguZmxvb3IoKHN1Ykxlbmd0aHMgLSAxKSAvIE0pICsgMSk7XG59XG5cbi8vIGdldDIsIHNldDIgYW5kIHNhdmVTbG90IGFyZSBoZWxwZXJzIGZvciBhY2Nlc3NpbmcgZWxlbWVudHMgb3ZlciB0d28gYXJyYXlzLlxuZnVuY3Rpb24gZ2V0MihhLCBiLCBpbmRleClcbntcblx0cmV0dXJuIGluZGV4IDwgYS5sZW5ndGhcblx0XHQ/IGFbaW5kZXhdXG5cdFx0OiBiW2luZGV4IC0gYS5sZW5ndGhdO1xufVxuXG5mdW5jdGlvbiBzZXQyKGEsIGIsIGluZGV4LCB2YWx1ZSlcbntcblx0aWYgKGluZGV4IDwgYS5sZW5ndGgpXG5cdHtcblx0XHRhW2luZGV4XSA9IHZhbHVlO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGJbaW5kZXggLSBhLmxlbmd0aF0gPSB2YWx1ZTtcblx0fVxufVxuXG5mdW5jdGlvbiBzYXZlU2xvdChhLCBiLCBpbmRleCwgc2xvdClcbntcblx0c2V0MihhLnRhYmxlLCBiLnRhYmxlLCBpbmRleCwgc2xvdCk7XG5cblx0dmFyIGwgPSAoaW5kZXggPT09IDAgfHwgaW5kZXggPT09IGEubGVuZ3Rocy5sZW5ndGgpXG5cdFx0PyAwXG5cdFx0OiBnZXQyKGEubGVuZ3RocywgYS5sZW5ndGhzLCBpbmRleCAtIDEpO1xuXG5cdHNldDIoYS5sZW5ndGhzLCBiLmxlbmd0aHMsIGluZGV4LCBsICsgbGVuZ3RoKHNsb3QpKTtcbn1cblxuLy8gQ3JlYXRlcyBhIG5vZGUgb3IgbGVhZiB3aXRoIGEgZ2l2ZW4gbGVuZ3RoIGF0IHRoZWlyIGFycmF5cyBmb3IgcGVyZm9tYW5jZS5cbi8vIElzIG9ubHkgdXNlZCBieSBzaHVmZmxlLlxuZnVuY3Rpb24gY3JlYXRlTm9kZShoLCBsZW5ndGgpXG57XG5cdGlmIChsZW5ndGggPCAwKVxuXHR7XG5cdFx0bGVuZ3RoID0gMDtcblx0fVxuXHR2YXIgYSA9IHtcblx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRoZWlnaHQ6IGgsXG5cdFx0dGFibGU6IG5ldyBBcnJheShsZW5ndGgpXG5cdH07XG5cdGlmIChoID4gMClcblx0e1xuXHRcdGEubGVuZ3RocyA9IG5ldyBBcnJheShsZW5ndGgpO1xuXHR9XG5cdHJldHVybiBhO1xufVxuXG4vLyBSZXR1cm5zIGFuIGFycmF5IG9mIHR3byBiYWxhbmNlZCBub2Rlcy5cbmZ1bmN0aW9uIHNodWZmbGUoYSwgYiwgdG9SZW1vdmUpXG57XG5cdHZhciBuZXdBID0gY3JlYXRlTm9kZShhLmhlaWdodCwgTWF0aC5taW4oTSwgYS50YWJsZS5sZW5ndGggKyBiLnRhYmxlLmxlbmd0aCAtIHRvUmVtb3ZlKSk7XG5cdHZhciBuZXdCID0gY3JlYXRlTm9kZShhLmhlaWdodCwgbmV3QS50YWJsZS5sZW5ndGggLSAoYS50YWJsZS5sZW5ndGggKyBiLnRhYmxlLmxlbmd0aCAtIHRvUmVtb3ZlKSk7XG5cblx0Ly8gU2tpcCB0aGUgc2xvdHMgd2l0aCBzaXplIE0uIE1vcmUgcHJlY2lzZTogY29weSB0aGUgc2xvdCByZWZlcmVuY2VzXG5cdC8vIHRvIHRoZSBuZXcgbm9kZVxuXHR2YXIgcmVhZCA9IDA7XG5cdHdoaWxlIChnZXQyKGEudGFibGUsIGIudGFibGUsIHJlYWQpLnRhYmxlLmxlbmd0aCAlIE0gPT09IDApXG5cdHtcblx0XHRzZXQyKG5ld0EudGFibGUsIG5ld0IudGFibGUsIHJlYWQsIGdldDIoYS50YWJsZSwgYi50YWJsZSwgcmVhZCkpO1xuXHRcdHNldDIobmV3QS5sZW5ndGhzLCBuZXdCLmxlbmd0aHMsIHJlYWQsIGdldDIoYS5sZW5ndGhzLCBiLmxlbmd0aHMsIHJlYWQpKTtcblx0XHRyZWFkKys7XG5cdH1cblxuXHQvLyBQdWxsaW5nIGl0ZW1zIGZyb20gbGVmdCB0byByaWdodCwgY2FjaGluZyBpbiBhIHNsb3QgYmVmb3JlIHdyaXRpbmdcblx0Ly8gaXQgaW50byB0aGUgbmV3IG5vZGVzLlxuXHR2YXIgd3JpdGUgPSByZWFkO1xuXHR2YXIgc2xvdCA9IG5ldyBjcmVhdGVOb2RlKGEuaGVpZ2h0IC0gMSwgMCk7XG5cdHZhciBmcm9tID0gMDtcblxuXHQvLyBJZiB0aGUgY3VycmVudCBzbG90IGlzIHN0aWxsIGNvbnRhaW5pbmcgZGF0YSwgdGhlbiB0aGVyZSB3aWxsIGJlIGF0XG5cdC8vIGxlYXN0IG9uZSBtb3JlIHdyaXRlLCBzbyB3ZSBkbyBub3QgYnJlYWsgdGhpcyBsb29wIHlldC5cblx0d2hpbGUgKHJlYWQgLSB3cml0ZSAtIChzbG90LnRhYmxlLmxlbmd0aCA+IDAgPyAxIDogMCkgPCB0b1JlbW92ZSlcblx0e1xuXHRcdC8vIEZpbmQgb3V0IHRoZSBtYXggcG9zc2libGUgaXRlbXMgZm9yIGNvcHlpbmcuXG5cdFx0dmFyIHNvdXJjZSA9IGdldDIoYS50YWJsZSwgYi50YWJsZSwgcmVhZCk7XG5cdFx0dmFyIHRvID0gTWF0aC5taW4oTSAtIHNsb3QudGFibGUubGVuZ3RoLCBzb3VyY2UudGFibGUubGVuZ3RoKTtcblxuXHRcdC8vIENvcHkgYW5kIGFkanVzdCBzaXplIHRhYmxlLlxuXHRcdHNsb3QudGFibGUgPSBzbG90LnRhYmxlLmNvbmNhdChzb3VyY2UudGFibGUuc2xpY2UoZnJvbSwgdG8pKTtcblx0XHRpZiAoc2xvdC5oZWlnaHQgPiAwKVxuXHRcdHtcblx0XHRcdHZhciBsZW4gPSBzbG90Lmxlbmd0aHMubGVuZ3RoO1xuXHRcdFx0Zm9yICh2YXIgaSA9IGxlbjsgaSA8IGxlbiArIHRvIC0gZnJvbTsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRzbG90Lmxlbmd0aHNbaV0gPSBsZW5ndGgoc2xvdC50YWJsZVtpXSk7XG5cdFx0XHRcdHNsb3QubGVuZ3Roc1tpXSArPSAoaSA+IDAgPyBzbG90Lmxlbmd0aHNbaSAtIDFdIDogMCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnJvbSArPSB0bztcblxuXHRcdC8vIE9ubHkgcHJvY2VlZCB0byBuZXh0IHNsb3RzW2ldIGlmIHRoZSBjdXJyZW50IG9uZSB3YXNcblx0XHQvLyBmdWxseSBjb3BpZWQuXG5cdFx0aWYgKHNvdXJjZS50YWJsZS5sZW5ndGggPD0gdG8pXG5cdFx0e1xuXHRcdFx0cmVhZCsrOyBmcm9tID0gMDtcblx0XHR9XG5cblx0XHQvLyBPbmx5IGNyZWF0ZSBhIG5ldyBzbG90IGlmIHRoZSBjdXJyZW50IG9uZSBpcyBmaWxsZWQgdXAuXG5cdFx0aWYgKHNsb3QudGFibGUubGVuZ3RoID09PSBNKVxuXHRcdHtcblx0XHRcdHNhdmVTbG90KG5ld0EsIG5ld0IsIHdyaXRlLCBzbG90KTtcblx0XHRcdHNsb3QgPSBjcmVhdGVOb2RlKGEuaGVpZ2h0IC0gMSwgMCk7XG5cdFx0XHR3cml0ZSsrO1xuXHRcdH1cblx0fVxuXG5cdC8vIENsZWFudXAgYWZ0ZXIgdGhlIGxvb3AuIENvcHkgdGhlIGxhc3Qgc2xvdCBpbnRvIHRoZSBuZXcgbm9kZXMuXG5cdGlmIChzbG90LnRhYmxlLmxlbmd0aCA+IDApXG5cdHtcblx0XHRzYXZlU2xvdChuZXdBLCBuZXdCLCB3cml0ZSwgc2xvdCk7XG5cdFx0d3JpdGUrKztcblx0fVxuXG5cdC8vIFNoaWZ0IHRoZSB1bnRvdWNoZWQgc2xvdHMgdG8gdGhlIGxlZnRcblx0d2hpbGUgKHJlYWQgPCBhLnRhYmxlLmxlbmd0aCArIGIudGFibGUubGVuZ3RoIClcblx0e1xuXHRcdHNhdmVTbG90KG5ld0EsIG5ld0IsIHdyaXRlLCBnZXQyKGEudGFibGUsIGIudGFibGUsIHJlYWQpKTtcblx0XHRyZWFkKys7XG5cdFx0d3JpdGUrKztcblx0fVxuXG5cdHJldHVybiBbbmV3QSwgbmV3Ql07XG59XG5cbi8vIE5hdmlnYXRpb24gZnVuY3Rpb25zXG5mdW5jdGlvbiBib3RSaWdodChhKVxue1xuXHRyZXR1cm4gYS50YWJsZVthLnRhYmxlLmxlbmd0aCAtIDFdO1xufVxuZnVuY3Rpb24gYm90TGVmdChhKVxue1xuXHRyZXR1cm4gYS50YWJsZVswXTtcbn1cblxuLy8gQ29waWVzIGEgbm9kZSBmb3IgdXBkYXRpbmcuIE5vdGUgdGhhdCB5b3Ugc2hvdWxkIG5vdCB1c2UgdGhpcyBpZlxuLy8gb25seSB1cGRhdGluZyBvbmx5IG9uZSBvZiBcInRhYmxlXCIgb3IgXCJsZW5ndGhzXCIgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMuXG5mdW5jdGlvbiBub2RlQ29weShhKVxue1xuXHR2YXIgbmV3QSA9IHtcblx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRoZWlnaHQ6IGEuaGVpZ2h0LFxuXHRcdHRhYmxlOiBhLnRhYmxlLnNsaWNlKClcblx0fTtcblx0aWYgKGEuaGVpZ2h0ID4gMClcblx0e1xuXHRcdG5ld0EubGVuZ3RocyA9IGEubGVuZ3Rocy5zbGljZSgpO1xuXHR9XG5cdHJldHVybiBuZXdBO1xufVxuXG4vLyBSZXR1cm5zIGhvdyBtYW55IGl0ZW1zIGFyZSBpbiB0aGUgdHJlZS5cbmZ1bmN0aW9uIGxlbmd0aChhcnJheSlcbntcblx0aWYgKGFycmF5LmhlaWdodCA9PT0gMClcblx0e1xuXHRcdHJldHVybiBhcnJheS50YWJsZS5sZW5ndGg7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0cmV0dXJuIGFycmF5Lmxlbmd0aHNbYXJyYXkubGVuZ3Rocy5sZW5ndGggLSAxXTtcblx0fVxufVxuXG4vLyBDYWxjdWxhdGVzIGluIHdoaWNoIHNsb3Qgb2YgXCJ0YWJsZVwiIHRoZSBpdGVtIHByb2JhYmx5IGlzLCB0aGVuXG4vLyBmaW5kIHRoZSBleGFjdCBzbG90IHZpYSBmb3J3YXJkIHNlYXJjaGluZyBpbiAgXCJsZW5ndGhzXCIuIFJldHVybnMgdGhlIGluZGV4LlxuZnVuY3Rpb24gZ2V0U2xvdChpLCBhKVxue1xuXHR2YXIgc2xvdCA9IGkgPj4gKDUgKiBhLmhlaWdodCk7XG5cdHdoaWxlIChhLmxlbmd0aHNbc2xvdF0gPD0gaSlcblx0e1xuXHRcdHNsb3QrKztcblx0fVxuXHRyZXR1cm4gc2xvdDtcbn1cblxuLy8gUmVjdXJzaXZlbHkgY3JlYXRlcyBhIHRyZWUgd2l0aCBhIGdpdmVuIGhlaWdodCBjb250YWluaW5nXG4vLyBvbmx5IHRoZSBnaXZlbiBpdGVtLlxuZnVuY3Rpb24gY3JlYXRlKGl0ZW0sIGgpXG57XG5cdGlmIChoID09PSAwKVxuXHR7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdFx0aGVpZ2h0OiAwLFxuXHRcdFx0dGFibGU6IFtpdGVtXVxuXHRcdH07XG5cdH1cblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRoZWlnaHQ6IGgsXG5cdFx0dGFibGU6IFtjcmVhdGUoaXRlbSwgaCAtIDEpXSxcblx0XHRsZW5ndGhzOiBbMV1cblx0fTtcbn1cblxuLy8gUmVjdXJzaXZlbHkgY3JlYXRlcyBhIHRyZWUgdGhhdCBjb250YWlucyB0aGUgZ2l2ZW4gdHJlZS5cbmZ1bmN0aW9uIHBhcmVudGlzZSh0cmVlLCBoKVxue1xuXHRpZiAoaCA9PT0gdHJlZS5oZWlnaHQpXG5cdHtcblx0XHRyZXR1cm4gdHJlZTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJ19BcnJheScsXG5cdFx0aGVpZ2h0OiBoLFxuXHRcdHRhYmxlOiBbcGFyZW50aXNlKHRyZWUsIGggLSAxKV0sXG5cdFx0bGVuZ3RoczogW2xlbmd0aCh0cmVlKV1cblx0fTtcbn1cblxuLy8gRW1waGFzaXplcyBibG9vZCBicm90aGVyaG9vZCBiZW5lYXRoIHR3byB0cmVlcy5cbmZ1bmN0aW9uIHNpYmxpc2UoYSwgYilcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnX0FycmF5Jyxcblx0XHRoZWlnaHQ6IGEuaGVpZ2h0ICsgMSxcblx0XHR0YWJsZTogW2EsIGJdLFxuXHRcdGxlbmd0aHM6IFtsZW5ndGgoYSksIGxlbmd0aChhKSArIGxlbmd0aChiKV1cblx0fTtcbn1cblxuZnVuY3Rpb24gdG9KU0FycmF5KGEpXG57XG5cdHZhciBqc0FycmF5ID0gbmV3IEFycmF5KGxlbmd0aChhKSk7XG5cdHRvSlNBcnJheV8oanNBcnJheSwgMCwgYSk7XG5cdHJldHVybiBqc0FycmF5O1xufVxuXG5mdW5jdGlvbiB0b0pTQXJyYXlfKGpzQXJyYXksIGksIGEpXG57XG5cdGZvciAodmFyIHQgPSAwOyB0IDwgYS50YWJsZS5sZW5ndGg7IHQrKylcblx0e1xuXHRcdGlmIChhLmhlaWdodCA9PT0gMClcblx0XHR7XG5cdFx0XHRqc0FycmF5W2kgKyB0XSA9IGEudGFibGVbdF07XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR2YXIgaW5jID0gdCA9PT0gMCA/IDAgOiBhLmxlbmd0aHNbdCAtIDFdO1xuXHRcdFx0dG9KU0FycmF5Xyhqc0FycmF5LCBpICsgaW5jLCBhLnRhYmxlW3RdKTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZnJvbUpTQXJyYXkoanNBcnJheSlcbntcblx0aWYgKGpzQXJyYXkubGVuZ3RoID09PSAwKVxuXHR7XG5cdFx0cmV0dXJuIGVtcHR5O1xuXHR9XG5cdHZhciBoID0gTWF0aC5mbG9vcihNYXRoLmxvZyhqc0FycmF5Lmxlbmd0aCkgLyBNYXRoLmxvZyhNKSk7XG5cdHJldHVybiBmcm9tSlNBcnJheV8oanNBcnJheSwgaCwgMCwganNBcnJheS5sZW5ndGgpO1xufVxuXG5mdW5jdGlvbiBmcm9tSlNBcnJheV8oanNBcnJheSwgaCwgZnJvbSwgdG8pXG57XG5cdGlmIChoID09PSAwKVxuXHR7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdFx0aGVpZ2h0OiAwLFxuXHRcdFx0dGFibGU6IGpzQXJyYXkuc2xpY2UoZnJvbSwgdG8pXG5cdFx0fTtcblx0fVxuXG5cdHZhciBzdGVwID0gTWF0aC5wb3coTSwgaCk7XG5cdHZhciB0YWJsZSA9IG5ldyBBcnJheShNYXRoLmNlaWwoKHRvIC0gZnJvbSkgLyBzdGVwKSk7XG5cdHZhciBsZW5ndGhzID0gbmV3IEFycmF5KHRhYmxlLmxlbmd0aCk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgdGFibGUubGVuZ3RoOyBpKyspXG5cdHtcblx0XHR0YWJsZVtpXSA9IGZyb21KU0FycmF5Xyhqc0FycmF5LCBoIC0gMSwgZnJvbSArIChpICogc3RlcCksIE1hdGgubWluKGZyb20gKyAoKGkgKyAxKSAqIHN0ZXApLCB0bykpO1xuXHRcdGxlbmd0aHNbaV0gPSBsZW5ndGgodGFibGVbaV0pICsgKGkgPiAwID8gbGVuZ3Roc1tpIC0gMV0gOiAwKTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICdfQXJyYXknLFxuXHRcdGhlaWdodDogaCxcblx0XHR0YWJsZTogdGFibGUsXG5cdFx0bGVuZ3RoczogbGVuZ3Roc1xuXHR9O1xufVxuXG5yZXR1cm4ge1xuXHRlbXB0eTogZW1wdHksXG5cdGZyb21MaXN0OiBmcm9tTGlzdCxcblx0dG9MaXN0OiB0b0xpc3QsXG5cdGluaXRpYWxpemU6IEYyKGluaXRpYWxpemUpLFxuXHRhcHBlbmQ6IEYyKGFwcGVuZCksXG5cdHB1c2g6IEYyKHB1c2gpLFxuXHRzbGljZTogRjMoc2xpY2UpLFxuXHRnZXQ6IEYyKGdldCksXG5cdHNldDogRjMoc2V0KSxcblx0bWFwOiBGMihtYXApLFxuXHRpbmRleGVkTWFwOiBGMihpbmRleGVkTWFwKSxcblx0Zm9sZGw6IEYzKGZvbGRsKSxcblx0Zm9sZHI6IEYzKGZvbGRyKSxcblx0bGVuZ3RoOiBsZW5ndGgsXG5cblx0dG9KU0FycmF5OiB0b0pTQXJyYXksXG5cdGZyb21KU0FycmF5OiBmcm9tSlNBcnJheVxufTtcblxufSgpO1xuLy9pbXBvcnQgTmF0aXZlLlV0aWxzIC8vXG5cbnZhciBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzID0gZnVuY3Rpb24oKSB7XG5cbmZ1bmN0aW9uIGRpdihhLCBiKVxue1xuXHRyZXR1cm4gKGEgLyBiKSB8IDA7XG59XG5mdW5jdGlvbiByZW0oYSwgYilcbntcblx0cmV0dXJuIGEgJSBiO1xufVxuZnVuY3Rpb24gbW9kKGEsIGIpXG57XG5cdGlmIChiID09PSAwKVxuXHR7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgcGVyZm9ybSBtb2QgMC4gRGl2aXNpb24gYnkgemVybyBlcnJvci4nKTtcblx0fVxuXHR2YXIgciA9IGEgJSBiO1xuXHR2YXIgbSA9IGEgPT09IDAgPyAwIDogKGIgPiAwID8gKGEgPj0gMCA/IHIgOiByICsgYikgOiAtbW9kKC1hLCAtYikpO1xuXG5cdHJldHVybiBtID09PSBiID8gMCA6IG07XG59XG5mdW5jdGlvbiBsb2dCYXNlKGJhc2UsIG4pXG57XG5cdHJldHVybiBNYXRoLmxvZyhuKSAvIE1hdGgubG9nKGJhc2UpO1xufVxuZnVuY3Rpb24gbmVnYXRlKG4pXG57XG5cdHJldHVybiAtbjtcbn1cbmZ1bmN0aW9uIGFicyhuKVxue1xuXHRyZXR1cm4gbiA8IDAgPyAtbiA6IG47XG59XG5cbmZ1bmN0aW9uIG1pbihhLCBiKVxue1xuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNtcChhLCBiKSA8IDAgPyBhIDogYjtcbn1cbmZ1bmN0aW9uIG1heChhLCBiKVxue1xuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNtcChhLCBiKSA+IDAgPyBhIDogYjtcbn1cbmZ1bmN0aW9uIGNsYW1wKGxvLCBoaSwgbilcbntcblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jbXAobiwgbG8pIDwgMFxuXHRcdD8gbG9cblx0XHQ6IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jbXAobiwgaGkpID4gMFxuXHRcdFx0PyBoaVxuXHRcdFx0OiBuO1xufVxuXG52YXIgb3JkID0gWydMVCcsICdFUScsICdHVCddO1xuXG5mdW5jdGlvbiBjb21wYXJlKHgsIHkpXG57XG5cdHJldHVybiB7IGN0b3I6IG9yZFtfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY21wKHgsIHkpICsgMV0gfTtcbn1cblxuZnVuY3Rpb24geG9yKGEsIGIpXG57XG5cdHJldHVybiBhICE9PSBiO1xufVxuZnVuY3Rpb24gbm90KGIpXG57XG5cdHJldHVybiAhYjtcbn1cbmZ1bmN0aW9uIGlzSW5maW5pdGUobilcbntcblx0cmV0dXJuIG4gPT09IEluZmluaXR5IHx8IG4gPT09IC1JbmZpbml0eTtcbn1cblxuZnVuY3Rpb24gdHJ1bmNhdGUobilcbntcblx0cmV0dXJuIG4gfCAwO1xufVxuXG5mdW5jdGlvbiBkZWdyZWVzKGQpXG57XG5cdHJldHVybiBkICogTWF0aC5QSSAvIDE4MDtcbn1cbmZ1bmN0aW9uIHR1cm5zKHQpXG57XG5cdHJldHVybiAyICogTWF0aC5QSSAqIHQ7XG59XG5mdW5jdGlvbiBmcm9tUG9sYXIocG9pbnQpXG57XG5cdHZhciByID0gcG9pbnQuXzA7XG5cdHZhciB0ID0gcG9pbnQuXzE7XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuVHVwbGUyKHIgKiBNYXRoLmNvcyh0KSwgciAqIE1hdGguc2luKHQpKTtcbn1cbmZ1bmN0aW9uIHRvUG9sYXIocG9pbnQpXG57XG5cdHZhciB4ID0gcG9pbnQuXzA7XG5cdHZhciB5ID0gcG9pbnQuXzE7XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuVHVwbGUyKE1hdGguc3FydCh4ICogeCArIHkgKiB5KSwgTWF0aC5hdGFuMih5LCB4KSk7XG59XG5cbnJldHVybiB7XG5cdGRpdjogRjIoZGl2KSxcblx0cmVtOiBGMihyZW0pLFxuXHRtb2Q6IEYyKG1vZCksXG5cblx0cGk6IE1hdGguUEksXG5cdGU6IE1hdGguRSxcblx0Y29zOiBNYXRoLmNvcyxcblx0c2luOiBNYXRoLnNpbixcblx0dGFuOiBNYXRoLnRhbixcblx0YWNvczogTWF0aC5hY29zLFxuXHRhc2luOiBNYXRoLmFzaW4sXG5cdGF0YW46IE1hdGguYXRhbixcblx0YXRhbjI6IEYyKE1hdGguYXRhbjIpLFxuXG5cdGRlZ3JlZXM6IGRlZ3JlZXMsXG5cdHR1cm5zOiB0dXJucyxcblx0ZnJvbVBvbGFyOiBmcm9tUG9sYXIsXG5cdHRvUG9sYXI6IHRvUG9sYXIsXG5cblx0c3FydDogTWF0aC5zcXJ0LFxuXHRsb2dCYXNlOiBGMihsb2dCYXNlKSxcblx0bmVnYXRlOiBuZWdhdGUsXG5cdGFiczogYWJzLFxuXHRtaW46IEYyKG1pbiksXG5cdG1heDogRjIobWF4KSxcblx0Y2xhbXA6IEYzKGNsYW1wKSxcblx0Y29tcGFyZTogRjIoY29tcGFyZSksXG5cblx0eG9yOiBGMih4b3IpLFxuXHRub3Q6IG5vdCxcblxuXHR0cnVuY2F0ZTogdHJ1bmNhdGUsXG5cdGNlaWxpbmc6IE1hdGguY2VpbCxcblx0Zmxvb3I6IE1hdGguZmxvb3IsXG5cdHJvdW5kOiBNYXRoLnJvdW5kLFxuXHR0b0Zsb2F0OiBmdW5jdGlvbih4KSB7IHJldHVybiB4OyB9LFxuXHRpc05hTjogaXNOYU4sXG5cdGlzSW5maW5pdGU6IGlzSW5maW5pdGVcbn07XG5cbn0oKTtcbi8vaW1wb3J0IC8vXG5cbnZhciBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMgPSBmdW5jdGlvbigpIHtcblxuLy8gQ09NUEFSSVNPTlNcblxuZnVuY3Rpb24gZXEoeCwgeSlcbntcblx0dmFyIHN0YWNrID0gW107XG5cdHZhciBpc0VxdWFsID0gZXFIZWxwKHgsIHksIDAsIHN0YWNrKTtcblx0dmFyIHBhaXI7XG5cdHdoaWxlIChpc0VxdWFsICYmIChwYWlyID0gc3RhY2sucG9wKCkpKVxuXHR7XG5cdFx0aXNFcXVhbCA9IGVxSGVscChwYWlyLngsIHBhaXIueSwgMCwgc3RhY2spO1xuXHR9XG5cdHJldHVybiBpc0VxdWFsO1xufVxuXG5cbmZ1bmN0aW9uIGVxSGVscCh4LCB5LCBkZXB0aCwgc3RhY2spXG57XG5cdGlmIChkZXB0aCA+IDEwMClcblx0e1xuXHRcdHN0YWNrLnB1c2goeyB4OiB4LCB5OiB5IH0pO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0aWYgKHggPT09IHkpXG5cdHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGlmICh0eXBlb2YgeCAhPT0gJ29iamVjdCcpXG5cdHtcblx0XHRpZiAodHlwZW9mIHggPT09ICdmdW5jdGlvbicpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHQnVHJ5aW5nIHRvIHVzZSBgKD09KWAgb24gZnVuY3Rpb25zLiBUaGVyZSBpcyBubyB3YXkgdG8ga25vdyBpZiBmdW5jdGlvbnMgYXJlIFwidGhlIHNhbWVcIiBpbiB0aGUgRWxtIHNlbnNlLidcblx0XHRcdFx0KyAnIFJlYWQgbW9yZSBhYm91dCB0aGlzIGF0IGh0dHA6Ly9wYWNrYWdlLmVsbS1sYW5nLm9yZy9wYWNrYWdlcy9lbG0tbGFuZy9jb3JlL2xhdGVzdC9CYXNpY3MjPT0nXG5cdFx0XHRcdCsgJyB3aGljaCBkZXNjcmliZXMgd2h5IGl0IGlzIHRoaXMgd2F5IGFuZCB3aGF0IHRoZSBiZXR0ZXIgdmVyc2lvbiB3aWxsIGxvb2sgbGlrZS4nXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAoeCA9PT0gbnVsbCB8fCB5ID09PSBudWxsKVxuXHR7XG5cdFx0cmV0dXJuIGZhbHNlXG5cdH1cblxuXHRpZiAoeCBpbnN0YW5jZW9mIERhdGUpXG5cdHtcblx0XHRyZXR1cm4geC5nZXRUaW1lKCkgPT09IHkuZ2V0VGltZSgpO1xuXHR9XG5cblx0aWYgKCEoJ2N0b3InIGluIHgpKVxuXHR7XG5cdFx0Zm9yICh2YXIga2V5IGluIHgpXG5cdFx0e1xuXHRcdFx0aWYgKCFlcUhlbHAoeFtrZXldLCB5W2tleV0sIGRlcHRoICsgMSwgc3RhY2spKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Ly8gY29udmVydCBEaWN0cyBhbmQgU2V0cyB0byBsaXN0c1xuXHRpZiAoeC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJyB8fCB4LmN0b3IgPT09ICdSQkVtcHR5X2VsbV9idWlsdGluJylcblx0e1xuXHRcdHggPSBfZWxtX2xhbmckY29yZSREaWN0JHRvTGlzdCh4KTtcblx0XHR5ID0gX2VsbV9sYW5nJGNvcmUkRGljdCR0b0xpc3QoeSk7XG5cdH1cblx0aWYgKHguY3RvciA9PT0gJ1NldF9lbG1fYnVpbHRpbicpXG5cdHtcblx0XHR4ID0gX2VsbV9sYW5nJGNvcmUkU2V0JHRvTGlzdCh4KTtcblx0XHR5ID0gX2VsbV9sYW5nJGNvcmUkU2V0JHRvTGlzdCh5KTtcblx0fVxuXG5cdC8vIGNoZWNrIGlmIGxpc3RzIGFyZSBlcXVhbCB3aXRob3V0IHJlY3Vyc2lvblxuXHRpZiAoeC5jdG9yID09PSAnOjonKVxuXHR7XG5cdFx0dmFyIGEgPSB4O1xuXHRcdHZhciBiID0geTtcblx0XHR3aGlsZSAoYS5jdG9yID09PSAnOjonICYmIGIuY3RvciA9PT0gJzo6Jylcblx0XHR7XG5cdFx0XHRpZiAoIWVxSGVscChhLl8wLCBiLl8wLCBkZXB0aCArIDEsIHN0YWNrKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0YSA9IGEuXzE7XG5cdFx0XHRiID0gYi5fMTtcblx0XHR9XG5cdFx0cmV0dXJuIGEuY3RvciA9PT0gYi5jdG9yO1xuXHR9XG5cblx0Ly8gY2hlY2sgaWYgQXJyYXlzIGFyZSBlcXVhbFxuXHRpZiAoeC5jdG9yID09PSAnX0FycmF5Jylcblx0e1xuXHRcdHZhciB4cyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS50b0pTQXJyYXkoeCk7XG5cdFx0dmFyIHlzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LnRvSlNBcnJheSh5KTtcblx0XHRpZiAoeHMubGVuZ3RoICE9PSB5cy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGlmICghZXFIZWxwKHhzW2ldLCB5c1tpXSwgZGVwdGggKyAxLCBzdGFjaykpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoIWVxSGVscCh4LmN0b3IsIHkuY3RvciwgZGVwdGggKyAxLCBzdGFjaykpXG5cdHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRmb3IgKHZhciBrZXkgaW4geClcblx0e1xuXHRcdGlmICghZXFIZWxwKHhba2V5XSwgeVtrZXldLCBkZXB0aCArIDEsIHN0YWNrKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0cnVlO1xufVxuXG4vLyBDb2RlIGluIEdlbmVyYXRlL0phdmFTY3JpcHQuaHMsIEJhc2ljcy5qcywgYW5kIExpc3QuanMgZGVwZW5kcyBvblxuLy8gdGhlIHBhcnRpY3VsYXIgaW50ZWdlciB2YWx1ZXMgYXNzaWduZWQgdG8gTFQsIEVRLCBhbmQgR1QuXG5cbnZhciBMVCA9IC0xLCBFUSA9IDAsIEdUID0gMTtcblxuZnVuY3Rpb24gY21wKHgsIHkpXG57XG5cdGlmICh0eXBlb2YgeCAhPT0gJ29iamVjdCcpXG5cdHtcblx0XHRyZXR1cm4geCA9PT0geSA/IEVRIDogeCA8IHkgPyBMVCA6IEdUO1xuXHR9XG5cblx0aWYgKHggaW5zdGFuY2VvZiBTdHJpbmcpXG5cdHtcblx0XHR2YXIgYSA9IHgudmFsdWVPZigpO1xuXHRcdHZhciBiID0geS52YWx1ZU9mKCk7XG5cdFx0cmV0dXJuIGEgPT09IGIgPyBFUSA6IGEgPCBiID8gTFQgOiBHVDtcblx0fVxuXG5cdGlmICh4LmN0b3IgPT09ICc6OicgfHwgeC5jdG9yID09PSAnW10nKVxuXHR7XG5cdFx0d2hpbGUgKHguY3RvciA9PT0gJzo6JyAmJiB5LmN0b3IgPT09ICc6OicpXG5cdFx0e1xuXHRcdFx0dmFyIG9yZCA9IGNtcCh4Ll8wLCB5Ll8wKTtcblx0XHRcdGlmIChvcmQgIT09IEVRKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gb3JkO1xuXHRcdFx0fVxuXHRcdFx0eCA9IHguXzE7XG5cdFx0XHR5ID0geS5fMTtcblx0XHR9XG5cdFx0cmV0dXJuIHguY3RvciA9PT0geS5jdG9yID8gRVEgOiB4LmN0b3IgPT09ICdbXScgPyBMVCA6IEdUO1xuXHR9XG5cblx0aWYgKHguY3Rvci5zbGljZSgwLCA2KSA9PT0gJ19UdXBsZScpXG5cdHtcblx0XHR2YXIgb3JkO1xuXHRcdHZhciBuID0geC5jdG9yLnNsaWNlKDYpIC0gMDtcblx0XHR2YXIgZXJyID0gJ2Nhbm5vdCBjb21wYXJlIHR1cGxlcyB3aXRoIG1vcmUgdGhhbiA2IGVsZW1lbnRzLic7XG5cdFx0aWYgKG4gPT09IDApIHJldHVybiBFUTtcblx0XHRpZiAobiA+PSAxKSB7IG9yZCA9IGNtcCh4Ll8wLCB5Ll8wKTsgaWYgKG9yZCAhPT0gRVEpIHJldHVybiBvcmQ7XG5cdFx0aWYgKG4gPj0gMikgeyBvcmQgPSBjbXAoeC5fMSwgeS5fMSk7IGlmIChvcmQgIT09IEVRKSByZXR1cm4gb3JkO1xuXHRcdGlmIChuID49IDMpIHsgb3JkID0gY21wKHguXzIsIHkuXzIpOyBpZiAob3JkICE9PSBFUSkgcmV0dXJuIG9yZDtcblx0XHRpZiAobiA+PSA0KSB7IG9yZCA9IGNtcCh4Ll8zLCB5Ll8zKTsgaWYgKG9yZCAhPT0gRVEpIHJldHVybiBvcmQ7XG5cdFx0aWYgKG4gPj0gNSkgeyBvcmQgPSBjbXAoeC5fNCwgeS5fNCk7IGlmIChvcmQgIT09IEVRKSByZXR1cm4gb3JkO1xuXHRcdGlmIChuID49IDYpIHsgb3JkID0gY21wKHguXzUsIHkuXzUpOyBpZiAob3JkICE9PSBFUSkgcmV0dXJuIG9yZDtcblx0XHRpZiAobiA+PSA3KSB0aHJvdyBuZXcgRXJyb3IoJ0NvbXBhcmlzb24gZXJyb3I6ICcgKyBlcnIpOyB9IH0gfSB9IH0gfVxuXHRcdHJldHVybiBFUTtcblx0fVxuXG5cdHRocm93IG5ldyBFcnJvcihcblx0XHQnQ29tcGFyaXNvbiBlcnJvcjogY29tcGFyaXNvbiBpcyBvbmx5IGRlZmluZWQgb24gaW50cywgJ1xuXHRcdCsgJ2Zsb2F0cywgdGltZXMsIGNoYXJzLCBzdHJpbmdzLCBsaXN0cyBvZiBjb21wYXJhYmxlIHZhbHVlcywgJ1xuXHRcdCsgJ2FuZCB0dXBsZXMgb2YgY29tcGFyYWJsZSB2YWx1ZXMuJ1xuXHQpO1xufVxuXG5cbi8vIENPTU1PTiBWQUxVRVNcblxudmFyIFR1cGxlMCA9IHtcblx0Y3RvcjogJ19UdXBsZTAnXG59O1xuXG5mdW5jdGlvbiBUdXBsZTIoeCwgeSlcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XzA6IHgsXG5cdFx0XzE6IHlcblx0fTtcbn1cblxuZnVuY3Rpb24gY2hyKGMpXG57XG5cdHJldHVybiBuZXcgU3RyaW5nKGMpO1xufVxuXG5cbi8vIEdVSURcblxudmFyIGNvdW50ID0gMDtcbmZ1bmN0aW9uIGd1aWQoXylcbntcblx0cmV0dXJuIGNvdW50Kys7XG59XG5cblxuLy8gUkVDT1JEU1xuXG5mdW5jdGlvbiB1cGRhdGUob2xkUmVjb3JkLCB1cGRhdGVkRmllbGRzKVxue1xuXHR2YXIgbmV3UmVjb3JkID0ge307XG5cdGZvciAodmFyIGtleSBpbiBvbGRSZWNvcmQpXG5cdHtcblx0XHR2YXIgdmFsdWUgPSAoa2V5IGluIHVwZGF0ZWRGaWVsZHMpID8gdXBkYXRlZEZpZWxkc1trZXldIDogb2xkUmVjb3JkW2tleV07XG5cdFx0bmV3UmVjb3JkW2tleV0gPSB2YWx1ZTtcblx0fVxuXHRyZXR1cm4gbmV3UmVjb3JkO1xufVxuXG5cbi8vLy8gTElTVCBTVFVGRiAvLy8vXG5cbnZhciBOaWwgPSB7IGN0b3I6ICdbXScgfTtcblxuZnVuY3Rpb24gQ29ucyhoZCwgdGwpXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJzo6Jyxcblx0XHRfMDogaGQsXG5cdFx0XzE6IHRsXG5cdH07XG59XG5cbmZ1bmN0aW9uIGFwcGVuZCh4cywgeXMpXG57XG5cdC8vIGFwcGVuZCBTdHJpbmdzXG5cdGlmICh0eXBlb2YgeHMgPT09ICdzdHJpbmcnKVxuXHR7XG5cdFx0cmV0dXJuIHhzICsgeXM7XG5cdH1cblxuXHQvLyBhcHBlbmQgTGlzdHNcblx0aWYgKHhzLmN0b3IgPT09ICdbXScpXG5cdHtcblx0XHRyZXR1cm4geXM7XG5cdH1cblx0dmFyIHJvb3QgPSBDb25zKHhzLl8wLCBOaWwpO1xuXHR2YXIgY3VyciA9IHJvb3Q7XG5cdHhzID0geHMuXzE7XG5cdHdoaWxlICh4cy5jdG9yICE9PSAnW10nKVxuXHR7XG5cdFx0Y3Vyci5fMSA9IENvbnMoeHMuXzAsIE5pbCk7XG5cdFx0eHMgPSB4cy5fMTtcblx0XHRjdXJyID0gY3Vyci5fMTtcblx0fVxuXHRjdXJyLl8xID0geXM7XG5cdHJldHVybiByb290O1xufVxuXG5cbi8vIENSQVNIRVNcblxuZnVuY3Rpb24gY3Jhc2gobW9kdWxlTmFtZSwgcmVnaW9uKVxue1xuXHRyZXR1cm4gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdCdSYW4gaW50byBhIGBEZWJ1Zy5jcmFzaGAgaW4gbW9kdWxlIGAnICsgbW9kdWxlTmFtZSArICdgICcgKyByZWdpb25Ub1N0cmluZyhyZWdpb24pICsgJ1xcbidcblx0XHRcdCsgJ1RoZSBtZXNzYWdlIHByb3ZpZGVkIGJ5IHRoZSBjb2RlIGF1dGhvciBpczpcXG5cXG4gICAgJ1xuXHRcdFx0KyBtZXNzYWdlXG5cdFx0KTtcblx0fTtcbn1cblxuZnVuY3Rpb24gY3Jhc2hDYXNlKG1vZHVsZU5hbWUsIHJlZ2lvbiwgdmFsdWUpXG57XG5cdHJldHVybiBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0J1JhbiBpbnRvIGEgYERlYnVnLmNyYXNoYCBpbiBtb2R1bGUgYCcgKyBtb2R1bGVOYW1lICsgJ2BcXG5cXG4nXG5cdFx0XHQrICdUaGlzIHdhcyBjYXVzZWQgYnkgdGhlIGBjYXNlYCBleHByZXNzaW9uICcgKyByZWdpb25Ub1N0cmluZyhyZWdpb24pICsgJy5cXG4nXG5cdFx0XHQrICdPbmUgb2YgdGhlIGJyYW5jaGVzIGVuZGVkIHdpdGggYSBjcmFzaCBhbmQgdGhlIGZvbGxvd2luZyB2YWx1ZSBnb3QgdGhyb3VnaDpcXG5cXG4gICAgJyArIHRvU3RyaW5nKHZhbHVlKSArICdcXG5cXG4nXG5cdFx0XHQrICdUaGUgbWVzc2FnZSBwcm92aWRlZCBieSB0aGUgY29kZSBhdXRob3IgaXM6XFxuXFxuICAgICdcblx0XHRcdCsgbWVzc2FnZVxuXHRcdCk7XG5cdH07XG59XG5cbmZ1bmN0aW9uIHJlZ2lvblRvU3RyaW5nKHJlZ2lvbilcbntcblx0aWYgKHJlZ2lvbi5zdGFydC5saW5lID09IHJlZ2lvbi5lbmQubGluZSlcblx0e1xuXHRcdHJldHVybiAnb24gbGluZSAnICsgcmVnaW9uLnN0YXJ0LmxpbmU7XG5cdH1cblx0cmV0dXJuICdiZXR3ZWVuIGxpbmVzICcgKyByZWdpb24uc3RhcnQubGluZSArICcgYW5kICcgKyByZWdpb24uZW5kLmxpbmU7XG59XG5cblxuLy8gVE8gU1RSSU5HXG5cbmZ1bmN0aW9uIHRvU3RyaW5nKHYpXG57XG5cdHZhciB0eXBlID0gdHlwZW9mIHY7XG5cdGlmICh0eXBlID09PSAnZnVuY3Rpb24nKVxuXHR7XG5cdFx0dmFyIG5hbWUgPSB2LmZ1bmMgPyB2LmZ1bmMubmFtZSA6IHYubmFtZTtcblx0XHRyZXR1cm4gJzxmdW5jdGlvbicgKyAobmFtZSA9PT0gJycgPyAnJyA6ICc6JykgKyBuYW1lICsgJz4nO1xuXHR9XG5cblx0aWYgKHR5cGUgPT09ICdib29sZWFuJylcblx0e1xuXHRcdHJldHVybiB2ID8gJ1RydWUnIDogJ0ZhbHNlJztcblx0fVxuXG5cdGlmICh0eXBlID09PSAnbnVtYmVyJylcblx0e1xuXHRcdHJldHVybiB2ICsgJyc7XG5cdH1cblxuXHRpZiAodiBpbnN0YW5jZW9mIFN0cmluZylcblx0e1xuXHRcdHJldHVybiAnXFwnJyArIGFkZFNsYXNoZXModiwgdHJ1ZSkgKyAnXFwnJztcblx0fVxuXG5cdGlmICh0eXBlID09PSAnc3RyaW5nJylcblx0e1xuXHRcdHJldHVybiAnXCInICsgYWRkU2xhc2hlcyh2LCBmYWxzZSkgKyAnXCInO1xuXHR9XG5cblx0aWYgKHYgPT09IG51bGwpXG5cdHtcblx0XHRyZXR1cm4gJ251bGwnO1xuXHR9XG5cblx0aWYgKHR5cGUgPT09ICdvYmplY3QnICYmICdjdG9yJyBpbiB2KVxuXHR7XG5cdFx0dmFyIGN0b3JTdGFydGVyID0gdi5jdG9yLnN1YnN0cmluZygwLCA1KTtcblxuXHRcdGlmIChjdG9yU3RhcnRlciA9PT0gJ19UdXBsJylcblx0XHR7XG5cdFx0XHR2YXIgb3V0cHV0ID0gW107XG5cdFx0XHRmb3IgKHZhciBrIGluIHYpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChrID09PSAnY3RvcicpIGNvbnRpbnVlO1xuXHRcdFx0XHRvdXRwdXQucHVzaCh0b1N0cmluZyh2W2tdKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gJygnICsgb3V0cHV0LmpvaW4oJywnKSArICcpJztcblx0XHR9XG5cblx0XHRpZiAoY3RvclN0YXJ0ZXIgPT09ICdfVGFzaycpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICc8dGFzaz4nXG5cdFx0fVxuXG5cdFx0aWYgKHYuY3RvciA9PT0gJ19BcnJheScpXG5cdFx0e1xuXHRcdFx0dmFyIGxpc3QgPSBfZWxtX2xhbmckY29yZSRBcnJheSR0b0xpc3Qodik7XG5cdFx0XHRyZXR1cm4gJ0FycmF5LmZyb21MaXN0ICcgKyB0b1N0cmluZyhsaXN0KTtcblx0XHR9XG5cblx0XHRpZiAodi5jdG9yID09PSAnPGRlY29kZXI+Jylcblx0XHR7XG5cdFx0XHRyZXR1cm4gJzxkZWNvZGVyPic7XG5cdFx0fVxuXG5cdFx0aWYgKHYuY3RvciA9PT0gJ19Qcm9jZXNzJylcblx0XHR7XG5cdFx0XHRyZXR1cm4gJzxwcm9jZXNzOicgKyB2LmlkICsgJz4nO1xuXHRcdH1cblxuXHRcdGlmICh2LmN0b3IgPT09ICc6OicpXG5cdFx0e1xuXHRcdFx0dmFyIG91dHB1dCA9ICdbJyArIHRvU3RyaW5nKHYuXzApO1xuXHRcdFx0diA9IHYuXzE7XG5cdFx0XHR3aGlsZSAodi5jdG9yID09PSAnOjonKVxuXHRcdFx0e1xuXHRcdFx0XHRvdXRwdXQgKz0gJywnICsgdG9TdHJpbmcodi5fMCk7XG5cdFx0XHRcdHYgPSB2Ll8xO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG91dHB1dCArICddJztcblx0XHR9XG5cblx0XHRpZiAodi5jdG9yID09PSAnW10nKVxuXHRcdHtcblx0XHRcdHJldHVybiAnW10nO1xuXHRcdH1cblxuXHRcdGlmICh2LmN0b3IgPT09ICdTZXRfZWxtX2J1aWx0aW4nKVxuXHRcdHtcblx0XHRcdHJldHVybiAnU2V0LmZyb21MaXN0ICcgKyB0b1N0cmluZyhfZWxtX2xhbmckY29yZSRTZXQkdG9MaXN0KHYpKTtcblx0XHR9XG5cblx0XHRpZiAodi5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJyB8fCB2LmN0b3IgPT09ICdSQkVtcHR5X2VsbV9idWlsdGluJylcblx0XHR7XG5cdFx0XHRyZXR1cm4gJ0RpY3QuZnJvbUxpc3QgJyArIHRvU3RyaW5nKF9lbG1fbGFuZyRjb3JlJERpY3QkdG9MaXN0KHYpKTtcblx0XHR9XG5cblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0Zm9yICh2YXIgaSBpbiB2KVxuXHRcdHtcblx0XHRcdGlmIChpID09PSAnY3RvcicpIGNvbnRpbnVlO1xuXHRcdFx0dmFyIHN0ciA9IHRvU3RyaW5nKHZbaV0pO1xuXHRcdFx0dmFyIGMwID0gc3RyWzBdO1xuXHRcdFx0dmFyIHBhcmVubGVzcyA9IGMwID09PSAneycgfHwgYzAgPT09ICcoJyB8fCBjMCA9PT0gJzwnIHx8IGMwID09PSAnXCInIHx8IHN0ci5pbmRleE9mKCcgJykgPCAwO1xuXHRcdFx0b3V0cHV0ICs9ICcgJyArIChwYXJlbmxlc3MgPyBzdHIgOiAnKCcgKyBzdHIgKyAnKScpO1xuXHRcdH1cblx0XHRyZXR1cm4gdi5jdG9yICsgb3V0cHV0O1xuXHR9XG5cblx0aWYgKHR5cGUgPT09ICdvYmplY3QnKVxuXHR7XG5cdFx0aWYgKHYgaW5zdGFuY2VvZiBEYXRlKVxuXHRcdHtcblx0XHRcdHJldHVybiAnPCcgKyB2LnRvU3RyaW5nKCkgKyAnPic7XG5cdFx0fVxuXG5cdFx0aWYgKHYuZWxtX3dlYl9zb2NrZXQpXG5cdFx0e1xuXHRcdFx0cmV0dXJuICc8d2Vic29ja2V0Pic7XG5cdFx0fVxuXG5cdFx0dmFyIG91dHB1dCA9IFtdO1xuXHRcdGZvciAodmFyIGsgaW4gdilcblx0XHR7XG5cdFx0XHRvdXRwdXQucHVzaChrICsgJyA9ICcgKyB0b1N0cmluZyh2W2tdKSk7XG5cdFx0fVxuXHRcdGlmIChvdXRwdXQubGVuZ3RoID09PSAwKVxuXHRcdHtcblx0XHRcdHJldHVybiAne30nO1xuXHRcdH1cblx0XHRyZXR1cm4gJ3sgJyArIG91dHB1dC5qb2luKCcsICcpICsgJyB9Jztcblx0fVxuXG5cdHJldHVybiAnPGludGVybmFsIHN0cnVjdHVyZT4nO1xufVxuXG5mdW5jdGlvbiBhZGRTbGFzaGVzKHN0ciwgaXNDaGFyKVxue1xuXHR2YXIgcyA9IHN0ci5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpXG5cdFx0XHQgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcblx0XHRcdCAgLnJlcGxhY2UoL1xcdC9nLCAnXFxcXHQnKVxuXHRcdFx0ICAucmVwbGFjZSgvXFxyL2csICdcXFxccicpXG5cdFx0XHQgIC5yZXBsYWNlKC9cXHYvZywgJ1xcXFx2Jylcblx0XHRcdCAgLnJlcGxhY2UoL1xcMC9nLCAnXFxcXDAnKTtcblx0aWYgKGlzQ2hhcilcblx0e1xuXHRcdHJldHVybiBzLnJlcGxhY2UoL1xcJy9nLCAnXFxcXFxcJycpO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdHJldHVybiBzLnJlcGxhY2UoL1xcXCIvZywgJ1xcXFxcIicpO1xuXHR9XG59XG5cblxucmV0dXJuIHtcblx0ZXE6IGVxLFxuXHRjbXA6IGNtcCxcblx0VHVwbGUwOiBUdXBsZTAsXG5cdFR1cGxlMjogVHVwbGUyLFxuXHRjaHI6IGNocixcblx0dXBkYXRlOiB1cGRhdGUsXG5cdGd1aWQ6IGd1aWQsXG5cblx0YXBwZW5kOiBGMihhcHBlbmQpLFxuXG5cdGNyYXNoOiBjcmFzaCxcblx0Y3Jhc2hDYXNlOiBjcmFzaENhc2UsXG5cblx0dG9TdHJpbmc6IHRvU3RyaW5nXG59O1xuXG59KCk7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJHVuY3VycnkgPSBGMihcblx0ZnVuY3Rpb24gKGYsIF9wMCkge1xuXHRcdHZhciBfcDEgPSBfcDA7XG5cdFx0cmV0dXJuIEEyKGYsIF9wMS5fMCwgX3AxLl8xKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGN1cnJ5ID0gRjMoXG5cdGZ1bmN0aW9uIChmLCBhLCBiKSB7XG5cdFx0cmV0dXJuIGYoXG5cdFx0XHR7Y3RvcjogJ19UdXBsZTInLCBfMDogYSwgXzE6IGJ9KTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGZsaXAgPSBGMyhcblx0ZnVuY3Rpb24gKGYsIGIsIGEpIHtcblx0XHRyZXR1cm4gQTIoZiwgYSwgYik7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRzbmQgPSBmdW5jdGlvbiAoX3AyKSB7XG5cdHZhciBfcDMgPSBfcDI7XG5cdHJldHVybiBfcDMuXzE7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRmc3QgPSBmdW5jdGlvbiAoX3A0KSB7XG5cdHZhciBfcDUgPSBfcDQ7XG5cdHJldHVybiBfcDUuXzA7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRhbHdheXMgPSBGMihcblx0ZnVuY3Rpb24gKGEsIF9wNikge1xuXHRcdHJldHVybiBhO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkaWRlbnRpdHkgPSBmdW5jdGlvbiAoeCkge1xuXHRyZXR1cm4geDtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWyc8fCddID0gRjIoXG5cdGZ1bmN0aW9uIChmLCB4KSB7XG5cdFx0cmV0dXJuIGYoeCk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snfD4nXSA9IEYyKFxuXHRmdW5jdGlvbiAoeCwgZikge1xuXHRcdHJldHVybiBmKHgpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHNbJz4+J10gPSBGMyhcblx0ZnVuY3Rpb24gKGYsIGcsIHgpIHtcblx0XHRyZXR1cm4gZyhcblx0XHRcdGYoeCkpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHNbJzw8J10gPSBGMyhcblx0ZnVuY3Rpb24gKGcsIGYsIHgpIHtcblx0XHRyZXR1cm4gZyhcblx0XHRcdGYoeCkpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHNbJysrJ10gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuYXBwZW5kO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyR0b1N0cmluZyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy50b1N0cmluZztcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkaXNJbmZpbml0ZSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuaXNJbmZpbml0ZTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkaXNOYU4gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmlzTmFOO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyR0b0Zsb2F0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy50b0Zsb2F0O1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRjZWlsaW5nID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5jZWlsaW5nO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRmbG9vciA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuZmxvb3I7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJHRydW5jYXRlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy50cnVuY2F0ZTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Mkcm91bmQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLnJvdW5kO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRub3QgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLm5vdDtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkeG9yID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy54b3I7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWyd8fCddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5vcjtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHNbJyYmJ10gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmFuZDtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkbWF4ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5tYXg7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJG1pbiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MubWluO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRjb21wYXJlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5jb21wYXJlO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snPj0nXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuZ2U7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWyc8PSddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5sZTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHNbJz4nXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuZ3Q7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWyc8J10gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmx0O1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snLz0nXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MubmVxO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snPT0nXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuZXE7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGUgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmU7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJHBpID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5waTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkY2xhbXAgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmNsYW1wO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRsb2dCYXNlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5sb2dCYXNlO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRhYnMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmFicztcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkbmVnYXRlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5uZWdhdGU7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJHNxcnQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLnNxcnQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGF0YW4yID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5hdGFuMjtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkYXRhbiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuYXRhbjtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkYXNpbiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuYXNpbjtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkYWNvcyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuYWNvcztcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkdGFuID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy50YW47XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJHNpbiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3Muc2luO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRjb3MgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmNvcztcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHNbJ14nXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuZXhwO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snJSddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5tb2Q7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJHJlbSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MucmVtO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snLy8nXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuZGl2O1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snLyddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5mbG9hdERpdjtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzID0gX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHNbJyonXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MubXVsO1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgPSBfZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wc1snLSddID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5zdWI7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzX29wcyA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljc19vcHMgfHwge307XG5fZWxtX2xhbmckY29yZSRCYXNpY3Nfb3BzWycrJ10gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQmFzaWNzLmFkZDtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkdG9Qb2xhciA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MudG9Qb2xhcjtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkZnJvbVBvbGFyID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy5mcm9tUG9sYXI7XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJHR1cm5zID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0Jhc2ljcy50dXJucztcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkZGVncmVlcyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9CYXNpY3MuZGVncmVlcztcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkcmFkaWFucyA9IGZ1bmN0aW9uICh0KSB7XG5cdHJldHVybiB0O1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkR1QgPSB7Y3RvcjogJ0dUJ307XG52YXIgX2VsbV9sYW5nJGNvcmUkQmFzaWNzJEVRID0ge2N0b3I6ICdFUSd9O1xudmFyIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRMVCA9IHtjdG9yOiAnTFQnfTtcbnZhciBfZWxtX2xhbmckY29yZSRCYXNpY3MkTmV2ZXIgPSBmdW5jdGlvbiAoYSkge1xuXHRyZXR1cm4ge2N0b3I6ICdOZXZlcicsIF8wOiBhfTtcbn07XG5cbnZhciBfZWxtX2xhbmckY29yZSRNYXliZSR3aXRoRGVmYXVsdCA9IEYyKFxuXHRmdW5jdGlvbiAoJGRlZmF1bHQsIG1heWJlKSB7XG5cdFx0dmFyIF9wMCA9IG1heWJlO1xuXHRcdGlmIChfcDAuY3RvciA9PT0gJ0p1c3QnKSB7XG5cdFx0XHRyZXR1cm4gX3AwLl8wO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gJGRlZmF1bHQ7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nID0ge2N0b3I6ICdOb3RoaW5nJ307XG52YXIgX2VsbV9sYW5nJGNvcmUkTWF5YmUkb25lT2YgPSBmdW5jdGlvbiAobWF5YmVzKSB7XG5cdG9uZU9mOlxuXHR3aGlsZSAodHJ1ZSkge1xuXHRcdHZhciBfcDEgPSBtYXliZXM7XG5cdFx0aWYgKF9wMS5jdG9yID09PSAnW10nKSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZztcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIF9wMyA9IF9wMS5fMDtcblx0XHRcdHZhciBfcDIgPSBfcDM7XG5cdFx0XHRpZiAoX3AyLmN0b3IgPT09ICdOb3RoaW5nJykge1xuXHRcdFx0XHR2YXIgX3YzID0gX3AxLl8xO1xuXHRcdFx0XHRtYXliZXMgPSBfdjM7XG5cdFx0XHRcdGNvbnRpbnVlIG9uZU9mO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIF9wMztcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkTWF5YmUkYW5kVGhlbiA9IEYyKFxuXHRmdW5jdGlvbiAobWF5YmVWYWx1ZSwgY2FsbGJhY2spIHtcblx0XHR2YXIgX3A0ID0gbWF5YmVWYWx1ZTtcblx0XHRpZiAoX3A0LmN0b3IgPT09ICdKdXN0Jykge1xuXHRcdFx0cmV0dXJuIGNhbGxiYWNrKF9wNC5fMCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTWF5YmUkSnVzdCA9IGZ1bmN0aW9uIChhKSB7XG5cdHJldHVybiB7Y3RvcjogJ0p1c3QnLCBfMDogYX07XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJE1heWJlJG1hcCA9IEYyKFxuXHRmdW5jdGlvbiAoZiwgbWF5YmUpIHtcblx0XHR2YXIgX3A1ID0gbWF5YmU7XG5cdFx0aWYgKF9wNS5jdG9yID09PSAnSnVzdCcpIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0KFxuXHRcdFx0XHRmKF9wNS5fMCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZztcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJE1heWJlJG1hcDIgPSBGMyhcblx0ZnVuY3Rpb24gKGZ1bmMsIG1hLCBtYikge1xuXHRcdHZhciBfcDYgPSB7Y3RvcjogJ19UdXBsZTInLCBfMDogbWEsIF8xOiBtYn07XG5cdFx0aWYgKCgoX3A2LmN0b3IgPT09ICdfVHVwbGUyJykgJiYgKF9wNi5fMC5jdG9yID09PSAnSnVzdCcpKSAmJiAoX3A2Ll8xLmN0b3IgPT09ICdKdXN0JykpIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0KFxuXHRcdFx0XHRBMihmdW5jLCBfcDYuXzAuXzAsIF9wNi5fMS5fMCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZztcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJE1heWJlJG1hcDMgPSBGNChcblx0ZnVuY3Rpb24gKGZ1bmMsIG1hLCBtYiwgbWMpIHtcblx0XHR2YXIgX3A3ID0ge2N0b3I6ICdfVHVwbGUzJywgXzA6IG1hLCBfMTogbWIsIF8yOiBtY307XG5cdFx0aWYgKCgoKF9wNy5jdG9yID09PSAnX1R1cGxlMycpICYmIChfcDcuXzAuY3RvciA9PT0gJ0p1c3QnKSkgJiYgKF9wNy5fMS5jdG9yID09PSAnSnVzdCcpKSAmJiAoX3A3Ll8yLmN0b3IgPT09ICdKdXN0JykpIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0KFxuXHRcdFx0XHRBMyhmdW5jLCBfcDcuXzAuXzAsIF9wNy5fMS5fMCwgX3A3Ll8yLl8wKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTWF5YmUkbWFwNCA9IEY1KFxuXHRmdW5jdGlvbiAoZnVuYywgbWEsIG1iLCBtYywgbWQpIHtcblx0XHR2YXIgX3A4ID0ge2N0b3I6ICdfVHVwbGU0JywgXzA6IG1hLCBfMTogbWIsIF8yOiBtYywgXzM6IG1kfTtcblx0XHRpZiAoKCgoKF9wOC5jdG9yID09PSAnX1R1cGxlNCcpICYmIChfcDguXzAuY3RvciA9PT0gJ0p1c3QnKSkgJiYgKF9wOC5fMS5jdG9yID09PSAnSnVzdCcpKSAmJiAoX3A4Ll8yLmN0b3IgPT09ICdKdXN0JykpICYmIChfcDguXzMuY3RvciA9PT0gJ0p1c3QnKSkge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QoXG5cdFx0XHRcdEE0KGZ1bmMsIF9wOC5fMC5fMCwgX3A4Ll8xLl8wLCBfcDguXzIuXzAsIF9wOC5fMy5fMCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZztcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJE1heWJlJG1hcDUgPSBGNihcblx0ZnVuY3Rpb24gKGZ1bmMsIG1hLCBtYiwgbWMsIG1kLCBtZSkge1xuXHRcdHZhciBfcDkgPSB7Y3RvcjogJ19UdXBsZTUnLCBfMDogbWEsIF8xOiBtYiwgXzI6IG1jLCBfMzogbWQsIF80OiBtZX07XG5cdFx0aWYgKCgoKCgoX3A5LmN0b3IgPT09ICdfVHVwbGU1JykgJiYgKF9wOS5fMC5jdG9yID09PSAnSnVzdCcpKSAmJiAoX3A5Ll8xLmN0b3IgPT09ICdKdXN0JykpICYmIChfcDkuXzIuY3RvciA9PT0gJ0p1c3QnKSkgJiYgKF9wOS5fMy5jdG9yID09PSAnSnVzdCcpKSAmJiAoX3A5Ll80LmN0b3IgPT09ICdKdXN0JykpIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0KFxuXHRcdFx0XHRBNShmdW5jLCBfcDkuXzAuXzAsIF9wOS5fMS5fMCwgX3A5Ll8yLl8wLCBfcDkuXzMuXzAsIF9wOS5fNC5fMCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZztcblx0XHR9XG5cdH0pO1xuXG4vL2ltcG9ydCBOYXRpdmUuVXRpbHMgLy9cblxudmFyIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0ID0gZnVuY3Rpb24oKSB7XG5cbnZhciBOaWwgPSB7IGN0b3I6ICdbXScgfTtcblxuZnVuY3Rpb24gQ29ucyhoZCwgdGwpXG57XG5cdHJldHVybiB7IGN0b3I6ICc6OicsIF8wOiBoZCwgXzE6IHRsIH07XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheShhcnIpXG57XG5cdHZhciBvdXQgPSBOaWw7XG5cdGZvciAodmFyIGkgPSBhcnIubGVuZ3RoOyBpLS07IClcblx0e1xuXHRcdG91dCA9IENvbnMoYXJyW2ldLCBvdXQpO1xuXHR9XG5cdHJldHVybiBvdXQ7XG59XG5cbmZ1bmN0aW9uIHRvQXJyYXkoeHMpXG57XG5cdHZhciBvdXQgPSBbXTtcblx0d2hpbGUgKHhzLmN0b3IgIT09ICdbXScpXG5cdHtcblx0XHRvdXQucHVzaCh4cy5fMCk7XG5cdFx0eHMgPSB4cy5fMTtcblx0fVxuXHRyZXR1cm4gb3V0O1xufVxuXG5cbmZ1bmN0aW9uIHJhbmdlKGxvLCBoaSlcbntcblx0dmFyIGxpc3QgPSBOaWw7XG5cdGlmIChsbyA8PSBoaSlcblx0e1xuXHRcdGRvXG5cdFx0e1xuXHRcdFx0bGlzdCA9IENvbnMoaGksIGxpc3QpO1xuXHRcdH1cblx0XHR3aGlsZSAoaGktLSA+IGxvKTtcblx0fVxuXHRyZXR1cm4gbGlzdDtcbn1cblxuZnVuY3Rpb24gZm9sZHIoZiwgYiwgeHMpXG57XG5cdHZhciBhcnIgPSB0b0FycmF5KHhzKTtcblx0dmFyIGFjYyA9IGI7XG5cdGZvciAodmFyIGkgPSBhcnIubGVuZ3RoOyBpLS07IClcblx0e1xuXHRcdGFjYyA9IEEyKGYsIGFycltpXSwgYWNjKTtcblx0fVxuXHRyZXR1cm4gYWNjO1xufVxuXG5mdW5jdGlvbiBtYXAyKGYsIHhzLCB5cylcbntcblx0dmFyIGFyciA9IFtdO1xuXHR3aGlsZSAoeHMuY3RvciAhPT0gJ1tdJyAmJiB5cy5jdG9yICE9PSAnW10nKVxuXHR7XG5cdFx0YXJyLnB1c2goQTIoZiwgeHMuXzAsIHlzLl8wKSk7XG5cdFx0eHMgPSB4cy5fMTtcblx0XHR5cyA9IHlzLl8xO1xuXHR9XG5cdHJldHVybiBmcm9tQXJyYXkoYXJyKTtcbn1cblxuZnVuY3Rpb24gbWFwMyhmLCB4cywgeXMsIHpzKVxue1xuXHR2YXIgYXJyID0gW107XG5cdHdoaWxlICh4cy5jdG9yICE9PSAnW10nICYmIHlzLmN0b3IgIT09ICdbXScgJiYgenMuY3RvciAhPT0gJ1tdJylcblx0e1xuXHRcdGFyci5wdXNoKEEzKGYsIHhzLl8wLCB5cy5fMCwgenMuXzApKTtcblx0XHR4cyA9IHhzLl8xO1xuXHRcdHlzID0geXMuXzE7XG5cdFx0enMgPSB6cy5fMTtcblx0fVxuXHRyZXR1cm4gZnJvbUFycmF5KGFycik7XG59XG5cbmZ1bmN0aW9uIG1hcDQoZiwgd3MsIHhzLCB5cywgenMpXG57XG5cdHZhciBhcnIgPSBbXTtcblx0d2hpbGUgKCAgIHdzLmN0b3IgIT09ICdbXSdcblx0XHQgICAmJiB4cy5jdG9yICE9PSAnW10nXG5cdFx0ICAgJiYgeXMuY3RvciAhPT0gJ1tdJ1xuXHRcdCAgICYmIHpzLmN0b3IgIT09ICdbXScpXG5cdHtcblx0XHRhcnIucHVzaChBNChmLCB3cy5fMCwgeHMuXzAsIHlzLl8wLCB6cy5fMCkpO1xuXHRcdHdzID0gd3MuXzE7XG5cdFx0eHMgPSB4cy5fMTtcblx0XHR5cyA9IHlzLl8xO1xuXHRcdHpzID0genMuXzE7XG5cdH1cblx0cmV0dXJuIGZyb21BcnJheShhcnIpO1xufVxuXG5mdW5jdGlvbiBtYXA1KGYsIHZzLCB3cywgeHMsIHlzLCB6cylcbntcblx0dmFyIGFyciA9IFtdO1xuXHR3aGlsZSAoICAgdnMuY3RvciAhPT0gJ1tdJ1xuXHRcdCAgICYmIHdzLmN0b3IgIT09ICdbXSdcblx0XHQgICAmJiB4cy5jdG9yICE9PSAnW10nXG5cdFx0ICAgJiYgeXMuY3RvciAhPT0gJ1tdJ1xuXHRcdCAgICYmIHpzLmN0b3IgIT09ICdbXScpXG5cdHtcblx0XHRhcnIucHVzaChBNShmLCB2cy5fMCwgd3MuXzAsIHhzLl8wLCB5cy5fMCwgenMuXzApKTtcblx0XHR2cyA9IHZzLl8xO1xuXHRcdHdzID0gd3MuXzE7XG5cdFx0eHMgPSB4cy5fMTtcblx0XHR5cyA9IHlzLl8xO1xuXHRcdHpzID0genMuXzE7XG5cdH1cblx0cmV0dXJuIGZyb21BcnJheShhcnIpO1xufVxuXG5mdW5jdGlvbiBzb3J0QnkoZiwgeHMpXG57XG5cdHJldHVybiBmcm9tQXJyYXkodG9BcnJheSh4cykuc29ydChmdW5jdGlvbihhLCBiKSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jbXAoZihhKSwgZihiKSk7XG5cdH0pKTtcbn1cblxuZnVuY3Rpb24gc29ydFdpdGgoZiwgeHMpXG57XG5cdHJldHVybiBmcm9tQXJyYXkodG9BcnJheSh4cykuc29ydChmdW5jdGlvbihhLCBiKSB7XG5cdFx0dmFyIG9yZCA9IGYoYSkoYikuY3Rvcjtcblx0XHRyZXR1cm4gb3JkID09PSAnRVEnID8gMCA6IG9yZCA9PT0gJ0xUJyA/IC0xIDogMTtcblx0fSkpO1xufVxuXG5yZXR1cm4ge1xuXHROaWw6IE5pbCxcblx0Q29uczogQ29ucyxcblx0Y29uczogRjIoQ29ucyksXG5cdHRvQXJyYXk6IHRvQXJyYXksXG5cdGZyb21BcnJheTogZnJvbUFycmF5LFxuXHRyYW5nZTogcmFuZ2UsXG5cblx0Zm9sZHI6IEYzKGZvbGRyKSxcblxuXHRtYXAyOiBGMyhtYXAyKSxcblx0bWFwMzogRjQobWFwMyksXG5cdG1hcDQ6IEY1KG1hcDQpLFxuXHRtYXA1OiBGNihtYXA1KSxcblx0c29ydEJ5OiBGMihzb3J0QnkpLFxuXHRzb3J0V2l0aDogRjIoc29ydFdpdGgpXG59O1xuXG59KCk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRzb3J0V2l0aCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LnNvcnRXaXRoO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3Qkc29ydEJ5ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3Quc29ydEJ5O1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3Qkc29ydCA9IGZ1bmN0aW9uICh4cykge1xuXHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkTGlzdCRzb3J0QnksIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRpZGVudGl0eSwgeHMpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JGRyb3AgPSBGMihcblx0ZnVuY3Rpb24gKG4sIGxpc3QpIHtcblx0XHRkcm9wOlxuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRpZiAoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNtcChuLCAwKSA8IDEpIHtcblx0XHRcdFx0cmV0dXJuIGxpc3Q7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgX3AwID0gbGlzdDtcblx0XHRcdFx0aWYgKF9wMC5jdG9yID09PSAnW10nKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGxpc3Q7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFyIF92MSA9IG4gLSAxLFxuXHRcdFx0XHRcdFx0X3YyID0gX3AwLl8xO1xuXHRcdFx0XHRcdG4gPSBfdjE7XG5cdFx0XHRcdFx0bGlzdCA9IF92Mjtcblx0XHRcdFx0XHRjb250aW51ZSBkcm9wO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JG1hcDUgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5tYXA1O1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkbWFwNCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0Lm1hcDQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRtYXAzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QubWFwMztcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JG1hcDIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5tYXAyO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkYW55ID0gRjIoXG5cdGZ1bmN0aW9uIChpc09rYXksIGxpc3QpIHtcblx0XHRhbnk6XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdHZhciBfcDEgPSBsaXN0O1xuXHRcdFx0aWYgKF9wMS5jdG9yID09PSAnW10nKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChpc09rYXkoX3AxLl8wKSkge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhciBfdjQgPSBpc09rYXksXG5cdFx0XHRcdFx0XHRfdjUgPSBfcDEuXzE7XG5cdFx0XHRcdFx0aXNPa2F5ID0gX3Y0O1xuXHRcdFx0XHRcdGxpc3QgPSBfdjU7XG5cdFx0XHRcdFx0Y29udGludWUgYW55O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JGFsbCA9IEYyKFxuXHRmdW5jdGlvbiAoaXNPa2F5LCBsaXN0KSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRub3QoXG5cdFx0XHRBMihcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRhbnksXG5cdFx0XHRcdGZ1bmN0aW9uIChfcDIpIHtcblx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkQmFzaWNzJG5vdChcblx0XHRcdFx0XHRcdGlzT2theShfcDIpKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0bGlzdCkpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JGZvbGRyID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZm9sZHI7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkbCA9IEYzKFxuXHRmdW5jdGlvbiAoZnVuYywgYWNjLCBsaXN0KSB7XG5cdFx0Zm9sZGw6XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdHZhciBfcDMgPSBsaXN0O1xuXHRcdFx0aWYgKF9wMy5jdG9yID09PSAnW10nKSB7XG5cdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgX3Y3ID0gZnVuYyxcblx0XHRcdFx0XHRfdjggPSBBMihmdW5jLCBfcDMuXzAsIGFjYyksXG5cdFx0XHRcdFx0X3Y5ID0gX3AzLl8xO1xuXHRcdFx0XHRmdW5jID0gX3Y3O1xuXHRcdFx0XHRhY2MgPSBfdjg7XG5cdFx0XHRcdGxpc3QgPSBfdjk7XG5cdFx0XHRcdGNvbnRpbnVlIGZvbGRsO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRsZW5ndGggPSBmdW5jdGlvbiAoeHMpIHtcblx0cmV0dXJuIEEzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZGwsXG5cdFx0RjIoXG5cdFx0XHRmdW5jdGlvbiAoX3A0LCBpKSB7XG5cdFx0XHRcdHJldHVybiBpICsgMTtcblx0XHRcdH0pLFxuXHRcdDAsXG5cdFx0eHMpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JHN1bSA9IGZ1bmN0aW9uIChudW1iZXJzKSB7XG5cdHJldHVybiBBMyhcblx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGZvbGRsLFxuXHRcdEYyKFxuXHRcdFx0ZnVuY3Rpb24gKHgsIHkpIHtcblx0XHRcdFx0cmV0dXJuIHggKyB5O1xuXHRcdFx0fSksXG5cdFx0MCxcblx0XHRudW1iZXJzKTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRwcm9kdWN0ID0gZnVuY3Rpb24gKG51bWJlcnMpIHtcblx0cmV0dXJuIEEzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZGwsXG5cdFx0RjIoXG5cdFx0XHRmdW5jdGlvbiAoeCwgeSkge1xuXHRcdFx0XHRyZXR1cm4geCAqIHk7XG5cdFx0XHR9KSxcblx0XHQxLFxuXHRcdG51bWJlcnMpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JG1heGltdW0gPSBmdW5jdGlvbiAobGlzdCkge1xuXHR2YXIgX3A1ID0gbGlzdDtcblx0aWYgKF9wNS5jdG9yID09PSAnOjonKSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QoXG5cdFx0XHRBMyhfZWxtX2xhbmckY29yZSRMaXN0JGZvbGRsLCBfZWxtX2xhbmckY29yZSRCYXNpY3MkbWF4LCBfcDUuXzAsIF9wNS5fMSkpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHR9XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkbWluaW11bSA9IGZ1bmN0aW9uIChsaXN0KSB7XG5cdHZhciBfcDYgPSBsaXN0O1xuXHRpZiAoX3A2LmN0b3IgPT09ICc6OicpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkSnVzdChcblx0XHRcdEEzKF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZGwsIF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRtaW4sIF9wNi5fMCwgX3A2Ll8xKSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmc7XG5cdH1cbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRpbmRleGVkTWFwID0gRjIoXG5cdGZ1bmN0aW9uIChmLCB4cykge1xuXHRcdHJldHVybiBBMyhcblx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkbWFwMixcblx0XHRcdGYsXG5cdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5yYW5nZShcblx0XHRcdFx0MCxcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRsZW5ndGgoeHMpIC0gMSksXG5cdFx0XHR4cyk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkbWVtYmVyID0gRjIoXG5cdGZ1bmN0aW9uICh4LCB4cykge1xuXHRcdHJldHVybiBBMihcblx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkYW55LFxuXHRcdFx0ZnVuY3Rpb24gKGEpIHtcblx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5lcShhLCB4KTtcblx0XHRcdH0sXG5cdFx0XHR4cyk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkaXNFbXB0eSA9IGZ1bmN0aW9uICh4cykge1xuXHR2YXIgX3A3ID0geHM7XG5cdGlmIChfcDcuY3RvciA9PT0gJ1tdJykge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JHRhaWwgPSBmdW5jdGlvbiAobGlzdCkge1xuXHR2YXIgX3A4ID0gbGlzdDtcblx0aWYgKF9wOC5jdG9yID09PSAnOjonKSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QoX3A4Ll8xKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZztcblx0fVxufTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JGhlYWQgPSBmdW5jdGlvbiAobGlzdCkge1xuXHR2YXIgX3A5ID0gbGlzdDtcblx0aWYgKF9wOS5jdG9yID09PSAnOjonKSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QoX3A5Ll8wKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZztcblx0fVxufTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0X29wcyA9IF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5jb25zO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkbWFwID0gRjIoXG5cdGZ1bmN0aW9uIChmLCB4cykge1xuXHRcdHJldHVybiBBMyhcblx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZHIsXG5cdFx0XHRGMihcblx0XHRcdFx0ZnVuY3Rpb24gKHgsIGFjYykge1xuXHRcdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLFxuXHRcdFx0XHRcdFx0Zih4KSxcblx0XHRcdFx0XHRcdGFjYyk7XG5cdFx0XHRcdH0pLFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRbXSksXG5cdFx0XHR4cyk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkZmlsdGVyID0gRjIoXG5cdGZ1bmN0aW9uIChwcmVkLCB4cykge1xuXHRcdHZhciBjb25kaXRpb25hbENvbnMgPSBGMihcblx0XHRcdGZ1bmN0aW9uICh4LCB4cyQpIHtcblx0XHRcdFx0cmV0dXJuIHByZWQoeCkgPyBBMihfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSwgeCwgeHMkKSA6IHhzJDtcblx0XHRcdH0pO1xuXHRcdHJldHVybiBBMyhcblx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZHIsXG5cdFx0XHRjb25kaXRpb25hbENvbnMsXG5cdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFtdKSxcblx0XHRcdHhzKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRtYXliZUNvbnMgPSBGMyhcblx0ZnVuY3Rpb24gKGYsIG14LCB4cykge1xuXHRcdHZhciBfcDEwID0gZihteCk7XG5cdFx0aWYgKF9wMTAuY3RvciA9PT0gJ0p1c3QnKSB7XG5cdFx0XHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIF9wMTAuXzAsIHhzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHhzO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRmaWx0ZXJNYXAgPSBGMihcblx0ZnVuY3Rpb24gKGYsIHhzKSB7XG5cdFx0cmV0dXJuIEEzKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkcixcblx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkbWF5YmVDb25zKGYpLFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRbXSksXG5cdFx0XHR4cyk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkcmV2ZXJzZSA9IGZ1bmN0aW9uIChsaXN0KSB7XG5cdHJldHVybiBBMyhcblx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGZvbGRsLFxuXHRcdEYyKFxuXHRcdFx0ZnVuY3Rpb24gKHgsIHkpIHtcblx0XHRcdFx0cmV0dXJuIEEyKF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLCB4LCB5KTtcblx0XHRcdH0pLFxuXHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFtdKSxcblx0XHRsaXN0KTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRzY2FubCA9IEYzKFxuXHRmdW5jdGlvbiAoZiwgYiwgeHMpIHtcblx0XHR2YXIgc2NhbjEgPSBGMihcblx0XHRcdGZ1bmN0aW9uICh4LCBhY2NBY2MpIHtcblx0XHRcdFx0dmFyIF9wMTEgPSBhY2NBY2M7XG5cdFx0XHRcdGlmIChfcDExLmN0b3IgPT09ICc6OicpIHtcblx0XHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSxcblx0XHRcdFx0XHRcdEEyKGYsIHgsIF9wMTEuXzApLFxuXHRcdFx0XHRcdFx0YWNjQWNjKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRcdFx0W10pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTGlzdCRyZXZlcnNlKFxuXHRcdFx0QTMoXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZGwsXG5cdFx0XHRcdHNjYW4xLFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0W2JdKSxcblx0XHRcdFx0eHMpKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRhcHBlbmQgPSBGMihcblx0ZnVuY3Rpb24gKHhzLCB5cykge1xuXHRcdHZhciBfcDEyID0geXM7XG5cdFx0aWYgKF9wMTIuY3RvciA9PT0gJ1tdJykge1xuXHRcdFx0cmV0dXJuIHhzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gQTMoXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZHIsXG5cdFx0XHRcdEYyKFxuXHRcdFx0XHRcdGZ1bmN0aW9uICh4LCB5KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIHgsIHkpO1xuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHR5cyxcblx0XHRcdFx0eHMpO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRjb25jYXQgPSBmdW5jdGlvbiAobGlzdHMpIHtcblx0cmV0dXJuIEEzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZHIsXG5cdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRhcHBlbmQsXG5cdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0W10pLFxuXHRcdGxpc3RzKTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCRjb25jYXRNYXAgPSBGMihcblx0ZnVuY3Rpb24gKGYsIGxpc3QpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTGlzdCRjb25jYXQoXG5cdFx0XHRBMihfZWxtX2xhbmckY29yZSRMaXN0JG1hcCwgZiwgbGlzdCkpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JHBhcnRpdGlvbiA9IEYyKFxuXHRmdW5jdGlvbiAocHJlZCwgbGlzdCkge1xuXHRcdHZhciBzdGVwID0gRjIoXG5cdFx0XHRmdW5jdGlvbiAoeCwgX3AxMykge1xuXHRcdFx0XHR2YXIgX3AxNCA9IF9wMTM7XG5cdFx0XHRcdHZhciBfcDE2ID0gX3AxNC5fMDtcblx0XHRcdFx0dmFyIF9wMTUgPSBfcDE0Ll8xO1xuXHRcdFx0XHRyZXR1cm4gcHJlZCh4KSA/IHtcblx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XzA6IEEyKF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLCB4LCBfcDE2KSxcblx0XHRcdFx0XHRfMTogX3AxNVxuXHRcdFx0XHR9IDoge1xuXHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRfMDogX3AxNixcblx0XHRcdFx0XHRfMTogQTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIHgsIF9wMTUpXG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gQTMoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGZvbGRyLFxuXHRcdFx0c3RlcCxcblx0XHRcdHtcblx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRfMDogX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRcdFtdKSxcblx0XHRcdFx0XzE6IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0XHRbXSlcblx0XHRcdH0sXG5cdFx0XHRsaXN0KTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCR1bnppcCA9IGZ1bmN0aW9uIChwYWlycykge1xuXHR2YXIgc3RlcCA9IEYyKFxuXHRcdGZ1bmN0aW9uIChfcDE4LCBfcDE3KSB7XG5cdFx0XHR2YXIgX3AxOSA9IF9wMTg7XG5cdFx0XHR2YXIgX3AyMCA9IF9wMTc7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdF8wOiBBMihfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSwgX3AxOS5fMCwgX3AyMC5fMCksXG5cdFx0XHRcdF8xOiBBMihfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSwgX3AxOS5fMSwgX3AyMC5fMSlcblx0XHRcdH07XG5cdFx0fSk7XG5cdHJldHVybiBBMyhcblx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGZvbGRyLFxuXHRcdHN0ZXAsXG5cdFx0e1xuXHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XzA6IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0W10pLFxuXHRcdFx0XzE6IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0W10pXG5cdFx0fSxcblx0XHRwYWlycyk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkaW50ZXJzcGVyc2UgPSBGMihcblx0ZnVuY3Rpb24gKHNlcCwgeHMpIHtcblx0XHR2YXIgX3AyMSA9IHhzO1xuXHRcdGlmIChfcDIxLmN0b3IgPT09ICdbXScpIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFtdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIHN0ZXAgPSBGMihcblx0XHRcdFx0ZnVuY3Rpb24gKHgsIHJlc3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSxcblx0XHRcdFx0XHRcdHNlcCxcblx0XHRcdFx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLCB4LCByZXN0KSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0dmFyIHNwZXJzZWQgPSBBMyhcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkcixcblx0XHRcdFx0c3RlcCxcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRcdFtdKSxcblx0XHRcdFx0X3AyMS5fMSk7XG5cdFx0XHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIF9wMjEuXzAsIHNwZXJzZWQpO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCR0YWtlUmV2ZXJzZSA9IEYzKFxuXHRmdW5jdGlvbiAobiwgbGlzdCwgdGFrZW4pIHtcblx0XHR0YWtlUmV2ZXJzZTpcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0aWYgKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jbXAobiwgMCkgPCAxKSB7XG5cdFx0XHRcdHJldHVybiB0YWtlbjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBfcDIyID0gbGlzdDtcblx0XHRcdFx0aWYgKF9wMjIuY3RvciA9PT0gJ1tdJykge1xuXHRcdFx0XHRcdHJldHVybiB0YWtlbjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YXIgX3YyMyA9IG4gLSAxLFxuXHRcdFx0XHRcdFx0X3YyNCA9IF9wMjIuXzEsXG5cdFx0XHRcdFx0XHRfdjI1ID0gQTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIF9wMjIuXzAsIHRha2VuKTtcblx0XHRcdFx0XHRuID0gX3YyMztcblx0XHRcdFx0XHRsaXN0ID0gX3YyNDtcblx0XHRcdFx0XHR0YWtlbiA9IF92MjU7XG5cdFx0XHRcdFx0Y29udGludWUgdGFrZVJldmVyc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJExpc3QkdGFrZVRhaWxSZWMgPSBGMihcblx0ZnVuY3Rpb24gKG4sIGxpc3QpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTGlzdCRyZXZlcnNlKFxuXHRcdFx0QTMoXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkdGFrZVJldmVyc2UsXG5cdFx0XHRcdG4sXG5cdFx0XHRcdGxpc3QsXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0XHRbXSkpKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCR0YWtlRmFzdCA9IEYzKFxuXHRmdW5jdGlvbiAoY3RyLCBuLCBsaXN0KSB7XG5cdFx0aWYgKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jbXAobiwgMCkgPCAxKSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRbXSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBfcDIzID0ge2N0b3I6ICdfVHVwbGUyJywgXzA6IG4sIF8xOiBsaXN0fTtcblx0XHRcdF92MjZfNTpcblx0XHRcdGRvIHtcblx0XHRcdFx0X3YyNl8xOlxuXHRcdFx0XHRkbyB7XG5cdFx0XHRcdFx0aWYgKF9wMjMuY3RvciA9PT0gJ19UdXBsZTInKSB7XG5cdFx0XHRcdFx0XHRpZiAoX3AyMy5fMS5jdG9yID09PSAnW10nKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBsaXN0O1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0aWYgKF9wMjMuXzEuXzEuY3RvciA9PT0gJzo6Jykge1xuXHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoX3AyMy5fMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjI2XzE7XG5cdFx0XHRcdFx0XHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0W19wMjMuXzEuXzAsIF9wMjMuXzEuXzEuXzBdKTtcblx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKF9wMjMuXzEuXzEuXzEuY3RvciA9PT0gJzo6Jykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRbX3AyMy5fMS5fMCwgX3AyMy5fMS5fMS5fMCwgX3AyMy5fMS5fMS5fMS5fMF0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MjZfNTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDIzLl8xLl8xLl8xLmN0b3IgPT09ICc6OicpICYmIChfcDIzLl8xLl8xLl8xLl8xLmN0b3IgPT09ICc6OicpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIF9wMjggPSBfcDIzLl8xLl8xLl8xLl8wO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZhciBfcDI3ID0gX3AyMy5fMS5fMS5fMDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YXIgX3AyNiA9IF9wMjMuXzEuXzA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFyIF9wMjUgPSBfcDIzLl8xLl8xLl8xLl8xLl8wO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZhciBfcDI0ID0gX3AyMy5fMS5fMS5fMS5fMS5fMTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jbXAoY3RyLCAxMDAwKSA+IDApID8gQTIoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9wMjYsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRBMihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9wMjcsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdEEyKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9wMjgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0QTIoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9wMjUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRBMihfZWxtX2xhbmckY29yZSRMaXN0JHRha2VUYWlsUmVjLCBuIC0gNCwgX3AyNCkpKSkpIDogQTIoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9wMjYsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRBMihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9wMjcsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdEEyKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9wMjgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0QTIoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0X29wc1snOjonXSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9wMjUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRBMyhfZWxtX2xhbmckY29yZSRMaXN0JHRha2VGYXN0LCBjdHIgKyAxLCBuIC0gNCwgX3AyNCkpKSkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MjZfNTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoX3AyMy5fMCA9PT0gMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YyNl8xO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjI2XzU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGJyZWFrIF92MjZfNTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gd2hpbGUoZmFsc2UpO1xuXHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRcdFtfcDIzLl8xLl8wXSk7XG5cdFx0XHR9IHdoaWxlKGZhbHNlKTtcblx0XHRcdHJldHVybiBsaXN0O1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkTGlzdCR0YWtlID0gRjIoXG5cdGZ1bmN0aW9uIChuLCBsaXN0KSB7XG5cdFx0cmV0dXJuIEEzKF9lbG1fbGFuZyRjb3JlJExpc3QkdGFrZUZhc3QsIDAsIG4sIGxpc3QpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JHJlcGVhdEhlbHAgPSBGMyhcblx0ZnVuY3Rpb24gKHJlc3VsdCwgbiwgdmFsdWUpIHtcblx0XHRyZXBlYXRIZWxwOlxuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRpZiAoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNtcChuLCAwKSA8IDEpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBfdjI3ID0gQTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIHZhbHVlLCByZXN1bHQpLFxuXHRcdFx0XHRcdF92MjggPSBuIC0gMSxcblx0XHRcdFx0XHRfdjI5ID0gdmFsdWU7XG5cdFx0XHRcdHJlc3VsdCA9IF92Mjc7XG5cdFx0XHRcdG4gPSBfdjI4O1xuXHRcdFx0XHR2YWx1ZSA9IF92Mjk7XG5cdFx0XHRcdGNvbnRpbnVlIHJlcGVhdEhlbHA7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRMaXN0JHJlcGVhdCA9IEYyKFxuXHRmdW5jdGlvbiAobiwgdmFsdWUpIHtcblx0XHRyZXR1cm4gQTMoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0JHJlcGVhdEhlbHAsXG5cdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFtdKSxcblx0XHRcdG4sXG5cdFx0XHR2YWx1ZSk7XG5cdH0pO1xuXG52YXIgX2VsbV9sYW5nJGNvcmUkQXJyYXkkYXBwZW5kID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LmFwcGVuZDtcbnZhciBfZWxtX2xhbmckY29yZSRBcnJheSRsZW5ndGggPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkubGVuZ3RoO1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JGlzRW1wdHkgPSBmdW5jdGlvbiAoYXJyYXkpIHtcblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5lcShcblx0XHRfZWxtX2xhbmckY29yZSRBcnJheSRsZW5ndGgoYXJyYXkpLFxuXHRcdDApO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRBcnJheSRzbGljZSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS5zbGljZTtcbnZhciBfZWxtX2xhbmckY29yZSRBcnJheSRzZXQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkuc2V0O1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JGdldCA9IEYyKFxuXHRmdW5jdGlvbiAoaSwgYXJyYXkpIHtcblx0XHRyZXR1cm4gKChfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY21wKDAsIGkpIDwgMSkgJiYgKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jbXAoXG5cdFx0XHRpLFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5Lmxlbmd0aChhcnJheSkpIDwgMCkpID8gX2VsbV9sYW5nJGNvcmUkTWF5YmUkSnVzdChcblx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS5nZXQsIGksIGFycmF5KSkgOiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRBcnJheSRwdXNoID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LnB1c2g7XG52YXIgX2VsbV9sYW5nJGNvcmUkQXJyYXkkZW1wdHkgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkuZW1wdHk7XG52YXIgX2VsbV9sYW5nJGNvcmUkQXJyYXkkZmlsdGVyID0gRjIoXG5cdGZ1bmN0aW9uIChpc09rYXksIGFycikge1xuXHRcdHZhciB1cGRhdGUgPSBGMihcblx0XHRcdGZ1bmN0aW9uICh4LCB4cykge1xuXHRcdFx0XHRyZXR1cm4gaXNPa2F5KHgpID8gQTIoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LnB1c2gsIHgsIHhzKSA6IHhzO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuIEEzKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS5mb2xkbCwgdXBkYXRlLCBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkuZW1wdHksIGFycik7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JGZvbGRyID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LmZvbGRyO1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JGZvbGRsID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LmZvbGRsO1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JGluZGV4ZWRNYXAgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkuaW5kZXhlZE1hcDtcbnZhciBfZWxtX2xhbmckY29yZSRBcnJheSRtYXAgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkubWFwO1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JHRvSW5kZXhlZExpc3QgPSBmdW5jdGlvbiAoYXJyYXkpIHtcblx0cmV0dXJuIEEzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkbWFwMixcblx0XHRGMihcblx0XHRcdGZ1bmN0aW9uICh2MCwgdjEpIHtcblx0XHRcdFx0cmV0dXJuIHtjdG9yOiAnX1R1cGxlMicsIF8wOiB2MCwgXzE6IHYxfTtcblx0XHRcdH0pLFxuXHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LnJhbmdlKFxuXHRcdFx0MCxcblx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS5sZW5ndGgoYXJyYXkpIC0gMSksXG5cdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LnRvTGlzdChhcnJheSkpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRBcnJheSR0b0xpc3QgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkudG9MaXN0O1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JGZyb21MaXN0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LmZyb21MaXN0O1xudmFyIF9lbG1fbGFuZyRjb3JlJEFycmF5JGluaXRpYWxpemUgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQXJyYXkuaW5pdGlhbGl6ZTtcbnZhciBfZWxtX2xhbmckY29yZSRBcnJheSRyZXBlYXQgPSBGMihcblx0ZnVuY3Rpb24gKG4sIGUpIHtcblx0XHRyZXR1cm4gQTIoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRBcnJheSRpbml0aWFsaXplLFxuXHRcdFx0bixcblx0XHRcdF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRhbHdheXMoZSkpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRBcnJheSRBcnJheSA9IHtjdG9yOiAnQXJyYXknfTtcblxuLy9pbXBvcnQgTmF0aXZlLlV0aWxzIC8vXG5cbnZhciBfZWxtX2xhbmckY29yZSROYXRpdmVfQ2hhciA9IGZ1bmN0aW9uKCkge1xuXG5yZXR1cm4ge1xuXHRmcm9tQ29kZTogZnVuY3Rpb24oYykgeyByZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocihTdHJpbmcuZnJvbUNoYXJDb2RlKGMpKTsgfSxcblx0dG9Db2RlOiBmdW5jdGlvbihjKSB7IHJldHVybiBjLmNoYXJDb2RlQXQoMCk7IH0sXG5cdHRvVXBwZXI6IGZ1bmN0aW9uKGMpIHsgcmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoYy50b1VwcGVyQ2FzZSgpKTsgfSxcblx0dG9Mb3dlcjogZnVuY3Rpb24oYykgeyByZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocihjLnRvTG93ZXJDYXNlKCkpOyB9LFxuXHR0b0xvY2FsZVVwcGVyOiBmdW5jdGlvbihjKSB7IHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKGMudG9Mb2NhbGVVcHBlckNhc2UoKSk7IH0sXG5cdHRvTG9jYWxlTG93ZXI6IGZ1bmN0aW9uKGMpIHsgcmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoYy50b0xvY2FsZUxvd2VyQ2FzZSgpKTsgfVxufTtcblxufSgpO1xudmFyIF9lbG1fbGFuZyRjb3JlJENoYXIkZnJvbUNvZGUgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQ2hhci5mcm9tQ29kZTtcbnZhciBfZWxtX2xhbmckY29yZSRDaGFyJHRvQ29kZSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9DaGFyLnRvQ29kZTtcbnZhciBfZWxtX2xhbmckY29yZSRDaGFyJHRvTG9jYWxlTG93ZXIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQ2hhci50b0xvY2FsZUxvd2VyO1xudmFyIF9lbG1fbGFuZyRjb3JlJENoYXIkdG9Mb2NhbGVVcHBlciA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9DaGFyLnRvTG9jYWxlVXBwZXI7XG52YXIgX2VsbV9sYW5nJGNvcmUkQ2hhciR0b0xvd2VyID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0NoYXIudG9Mb3dlcjtcbnZhciBfZWxtX2xhbmckY29yZSRDaGFyJHRvVXBwZXIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfQ2hhci50b1VwcGVyO1xudmFyIF9lbG1fbGFuZyRjb3JlJENoYXIkaXNCZXR3ZWVuID0gRjMoXG5cdGZ1bmN0aW9uIChsb3csIGhpZ2gsICRjaGFyKSB7XG5cdFx0dmFyIGNvZGUgPSBfZWxtX2xhbmckY29yZSRDaGFyJHRvQ29kZSgkY2hhcik7XG5cdFx0cmV0dXJuIChfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY21wKFxuXHRcdFx0Y29kZSxcblx0XHRcdF9lbG1fbGFuZyRjb3JlJENoYXIkdG9Db2RlKGxvdykpID4gLTEpICYmIChfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY21wKFxuXHRcdFx0Y29kZSxcblx0XHRcdF9lbG1fbGFuZyRjb3JlJENoYXIkdG9Db2RlKGhpZ2gpKSA8IDEpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRDaGFyJGlzVXBwZXIgPSBBMihcblx0X2VsbV9sYW5nJGNvcmUkQ2hhciRpc0JldHdlZW4sXG5cdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoJ0EnKSxcblx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocignWicpKTtcbnZhciBfZWxtX2xhbmckY29yZSRDaGFyJGlzTG93ZXIgPSBBMihcblx0X2VsbV9sYW5nJGNvcmUkQ2hhciRpc0JldHdlZW4sXG5cdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoJ2EnKSxcblx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocigneicpKTtcbnZhciBfZWxtX2xhbmckY29yZSRDaGFyJGlzRGlnaXQgPSBBMihcblx0X2VsbV9sYW5nJGNvcmUkQ2hhciRpc0JldHdlZW4sXG5cdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoJzAnKSxcblx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocignOScpKTtcbnZhciBfZWxtX2xhbmckY29yZSRDaGFyJGlzT2N0RGlnaXQgPSBBMihcblx0X2VsbV9sYW5nJGNvcmUkQ2hhciRpc0JldHdlZW4sXG5cdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoJzAnKSxcblx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocignNycpKTtcbnZhciBfZWxtX2xhbmckY29yZSRDaGFyJGlzSGV4RGlnaXQgPSBmdW5jdGlvbiAoJGNoYXIpIHtcblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJENoYXIkaXNEaWdpdCgkY2hhcikgfHwgKEEzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJENoYXIkaXNCZXR3ZWVuLFxuXHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoJ2EnKSxcblx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKCdmJyksXG5cdFx0JGNoYXIpIHx8IEEzKFxuXHRcdF9lbG1fbGFuZyRjb3JlJENoYXIkaXNCZXR3ZWVuLFxuXHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoJ0EnKSxcblx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKCdGJyksXG5cdFx0JGNoYXIpKTtcbn07XG5cbi8vaW1wb3J0IE5hdGl2ZS5VdGlscyAvL1xuXG52YXIgX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1NjaGVkdWxlciA9IGZ1bmN0aW9uKCkge1xuXG52YXIgTUFYX1NURVBTID0gMTAwMDA7XG5cblxuLy8gVEFTS1NcblxuZnVuY3Rpb24gc3VjY2VlZCh2YWx1ZSlcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnX1Rhc2tfc3VjY2VlZCcsXG5cdFx0dmFsdWU6IHZhbHVlXG5cdH07XG59XG5cbmZ1bmN0aW9uIGZhaWwoZXJyb3IpXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJ19UYXNrX2ZhaWwnLFxuXHRcdHZhbHVlOiBlcnJvclxuXHR9O1xufVxuXG5mdW5jdGlvbiBuYXRpdmVCaW5kaW5nKGNhbGxiYWNrKVxue1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICdfVGFza19uYXRpdmVCaW5kaW5nJyxcblx0XHRjYWxsYmFjazogY2FsbGJhY2ssXG5cdFx0Y2FuY2VsOiBudWxsXG5cdH07XG59XG5cbmZ1bmN0aW9uIGFuZFRoZW4odGFzaywgY2FsbGJhY2spXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJ19UYXNrX2FuZFRoZW4nLFxuXHRcdHRhc2s6IHRhc2ssXG5cdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdH07XG59XG5cbmZ1bmN0aW9uIG9uRXJyb3IodGFzaywgY2FsbGJhY2spXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJ19UYXNrX29uRXJyb3InLFxuXHRcdHRhc2s6IHRhc2ssXG5cdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdH07XG59XG5cbmZ1bmN0aW9uIHJlY2VpdmUoY2FsbGJhY2spXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJ19UYXNrX3JlY2VpdmUnLFxuXHRcdGNhbGxiYWNrOiBjYWxsYmFja1xuXHR9O1xufVxuXG5cbi8vIFBST0NFU1NFU1xuXG5mdW5jdGlvbiByYXdTcGF3bih0YXNrKVxue1xuXHR2YXIgcHJvY2VzcyA9IHtcblx0XHRjdG9yOiAnX1Byb2Nlc3MnLFxuXHRcdGlkOiBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuZ3VpZCgpLFxuXHRcdHJvb3Q6IHRhc2ssXG5cdFx0c3RhY2s6IG51bGwsXG5cdFx0bWFpbGJveDogW11cblx0fTtcblxuXHRlbnF1ZXVlKHByb2Nlc3MpO1xuXG5cdHJldHVybiBwcm9jZXNzO1xufVxuXG5mdW5jdGlvbiBzcGF3bih0YXNrKVxue1xuXHRyZXR1cm4gbmF0aXZlQmluZGluZyhmdW5jdGlvbihjYWxsYmFjaykge1xuXHRcdHZhciBwcm9jZXNzID0gcmF3U3Bhd24odGFzayk7XG5cdFx0Y2FsbGJhY2soc3VjY2VlZChwcm9jZXNzKSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiByYXdTZW5kKHByb2Nlc3MsIG1zZylcbntcblx0cHJvY2Vzcy5tYWlsYm94LnB1c2gobXNnKTtcblx0ZW5xdWV1ZShwcm9jZXNzKTtcbn1cblxuZnVuY3Rpb24gc2VuZChwcm9jZXNzLCBtc2cpXG57XG5cdHJldHVybiBuYXRpdmVCaW5kaW5nKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0cmF3U2VuZChwcm9jZXNzLCBtc2cpO1xuXHRcdGNhbGxiYWNrKHN1Y2NlZWQoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLlR1cGxlMCkpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24ga2lsbChwcm9jZXNzKVxue1xuXHRyZXR1cm4gbmF0aXZlQmluZGluZyhmdW5jdGlvbihjYWxsYmFjaykge1xuXHRcdHZhciByb290ID0gcHJvY2Vzcy5yb290O1xuXHRcdGlmIChyb290LmN0b3IgPT09ICdfVGFza19uYXRpdmVCaW5kaW5nJyAmJiByb290LmNhbmNlbClcblx0XHR7XG5cdFx0XHRyb290LmNhbmNlbCgpO1xuXHRcdH1cblxuXHRcdHByb2Nlc3Mucm9vdCA9IG51bGw7XG5cblx0XHRjYWxsYmFjayhzdWNjZWVkKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5UdXBsZTApKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIHNsZWVwKHRpbWUpXG57XG5cdHJldHVybiBuYXRpdmVCaW5kaW5nKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0dmFyIGlkID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdGNhbGxiYWNrKHN1Y2NlZWQoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLlR1cGxlMCkpO1xuXHRcdH0sIHRpbWUpO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uKCkgeyBjbGVhclRpbWVvdXQoaWQpOyB9O1xuXHR9KTtcbn1cblxuXG4vLyBTVEVQIFBST0NFU1NFU1xuXG5mdW5jdGlvbiBzdGVwKG51bVN0ZXBzLCBwcm9jZXNzKVxue1xuXHR3aGlsZSAobnVtU3RlcHMgPCBNQVhfU1RFUFMpXG5cdHtcblx0XHR2YXIgY3RvciA9IHByb2Nlc3Mucm9vdC5jdG9yO1xuXG5cdFx0aWYgKGN0b3IgPT09ICdfVGFza19zdWNjZWVkJylcblx0XHR7XG5cdFx0XHR3aGlsZSAocHJvY2Vzcy5zdGFjayAmJiBwcm9jZXNzLnN0YWNrLmN0b3IgPT09ICdfVGFza19vbkVycm9yJylcblx0XHRcdHtcblx0XHRcdFx0cHJvY2Vzcy5zdGFjayA9IHByb2Nlc3Muc3RhY2sucmVzdDtcblx0XHRcdH1cblx0XHRcdGlmIChwcm9jZXNzLnN0YWNrID09PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdHByb2Nlc3Mucm9vdCA9IHByb2Nlc3Muc3RhY2suY2FsbGJhY2socHJvY2Vzcy5yb290LnZhbHVlKTtcblx0XHRcdHByb2Nlc3Muc3RhY2sgPSBwcm9jZXNzLnN0YWNrLnJlc3Q7XG5cdFx0XHQrK251bVN0ZXBzO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKGN0b3IgPT09ICdfVGFza19mYWlsJylcblx0XHR7XG5cdFx0XHR3aGlsZSAocHJvY2Vzcy5zdGFjayAmJiBwcm9jZXNzLnN0YWNrLmN0b3IgPT09ICdfVGFza19hbmRUaGVuJylcblx0XHRcdHtcblx0XHRcdFx0cHJvY2Vzcy5zdGFjayA9IHByb2Nlc3Muc3RhY2sucmVzdDtcblx0XHRcdH1cblx0XHRcdGlmIChwcm9jZXNzLnN0YWNrID09PSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdHByb2Nlc3Mucm9vdCA9IHByb2Nlc3Muc3RhY2suY2FsbGJhY2socHJvY2Vzcy5yb290LnZhbHVlKTtcblx0XHRcdHByb2Nlc3Muc3RhY2sgPSBwcm9jZXNzLnN0YWNrLnJlc3Q7XG5cdFx0XHQrK251bVN0ZXBzO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0aWYgKGN0b3IgPT09ICdfVGFza19hbmRUaGVuJylcblx0XHR7XG5cdFx0XHRwcm9jZXNzLnN0YWNrID0ge1xuXHRcdFx0XHRjdG9yOiAnX1Rhc2tfYW5kVGhlbicsXG5cdFx0XHRcdGNhbGxiYWNrOiBwcm9jZXNzLnJvb3QuY2FsbGJhY2ssXG5cdFx0XHRcdHJlc3Q6IHByb2Nlc3Muc3RhY2tcblx0XHRcdH07XG5cdFx0XHRwcm9jZXNzLnJvb3QgPSBwcm9jZXNzLnJvb3QudGFzaztcblx0XHRcdCsrbnVtU3RlcHM7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRpZiAoY3RvciA9PT0gJ19UYXNrX29uRXJyb3InKVxuXHRcdHtcblx0XHRcdHByb2Nlc3Muc3RhY2sgPSB7XG5cdFx0XHRcdGN0b3I6ICdfVGFza19vbkVycm9yJyxcblx0XHRcdFx0Y2FsbGJhY2s6IHByb2Nlc3Mucm9vdC5jYWxsYmFjayxcblx0XHRcdFx0cmVzdDogcHJvY2Vzcy5zdGFja1xuXHRcdFx0fTtcblx0XHRcdHByb2Nlc3Mucm9vdCA9IHByb2Nlc3Mucm9vdC50YXNrO1xuXHRcdFx0KytudW1TdGVwcztcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGlmIChjdG9yID09PSAnX1Rhc2tfbmF0aXZlQmluZGluZycpXG5cdFx0e1xuXHRcdFx0cHJvY2Vzcy5yb290LmNhbmNlbCA9IHByb2Nlc3Mucm9vdC5jYWxsYmFjayhmdW5jdGlvbihuZXdSb290KSB7XG5cdFx0XHRcdHByb2Nlc3Mucm9vdCA9IG5ld1Jvb3Q7XG5cdFx0XHRcdGVucXVldWUocHJvY2Vzcyk7XG5cdFx0XHR9KTtcblxuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0aWYgKGN0b3IgPT09ICdfVGFza19yZWNlaXZlJylcblx0XHR7XG5cdFx0XHR2YXIgbWFpbGJveCA9IHByb2Nlc3MubWFpbGJveDtcblx0XHRcdGlmIChtYWlsYm94Lmxlbmd0aCA9PT0gMClcblx0XHRcdHtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cblx0XHRcdHByb2Nlc3Mucm9vdCA9IHByb2Nlc3Mucm9vdC5jYWxsYmFjayhtYWlsYm94LnNoaWZ0KCkpO1xuXHRcdFx0KytudW1TdGVwcztcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdHRocm93IG5ldyBFcnJvcihjdG9yKTtcblx0fVxuXG5cdGlmIChudW1TdGVwcyA8IE1BWF9TVEVQUylcblx0e1xuXHRcdHJldHVybiBudW1TdGVwcyArIDE7XG5cdH1cblx0ZW5xdWV1ZShwcm9jZXNzKTtcblxuXHRyZXR1cm4gbnVtU3RlcHM7XG59XG5cblxuLy8gV09SSyBRVUVVRVxuXG52YXIgd29ya2luZyA9IGZhbHNlO1xudmFyIHdvcmtRdWV1ZSA9IFtdO1xuXG5mdW5jdGlvbiBlbnF1ZXVlKHByb2Nlc3MpXG57XG5cdHdvcmtRdWV1ZS5wdXNoKHByb2Nlc3MpO1xuXG5cdGlmICghd29ya2luZylcblx0e1xuXHRcdHNldFRpbWVvdXQod29yaywgMCk7XG5cdFx0d29ya2luZyA9IHRydWU7XG5cdH1cbn1cblxuZnVuY3Rpb24gd29yaygpXG57XG5cdHZhciBudW1TdGVwcyA9IDA7XG5cdHZhciBwcm9jZXNzO1xuXHR3aGlsZSAobnVtU3RlcHMgPCBNQVhfU1RFUFMgJiYgKHByb2Nlc3MgPSB3b3JrUXVldWUuc2hpZnQoKSkpXG5cdHtcblx0XHRpZiAocHJvY2Vzcy5yb290KVxuXHRcdHtcblx0XHRcdG51bVN0ZXBzID0gc3RlcChudW1TdGVwcywgcHJvY2Vzcyk7XG5cdFx0fVxuXHR9XG5cdGlmICghcHJvY2Vzcylcblx0e1xuXHRcdHdvcmtpbmcgPSBmYWxzZTtcblx0XHRyZXR1cm47XG5cdH1cblx0c2V0VGltZW91dCh3b3JrLCAwKTtcbn1cblxuXG5yZXR1cm4ge1xuXHRzdWNjZWVkOiBzdWNjZWVkLFxuXHRmYWlsOiBmYWlsLFxuXHRuYXRpdmVCaW5kaW5nOiBuYXRpdmVCaW5kaW5nLFxuXHRhbmRUaGVuOiBGMihhbmRUaGVuKSxcblx0b25FcnJvcjogRjIob25FcnJvciksXG5cdHJlY2VpdmU6IHJlY2VpdmUsXG5cblx0c3Bhd246IHNwYXduLFxuXHRraWxsOiBraWxsLFxuXHRzbGVlcDogc2xlZXAsXG5cdHNlbmQ6IEYyKHNlbmQpLFxuXG5cdHJhd1NwYXduOiByYXdTcGF3bixcblx0cmF3U2VuZDogcmF3U2VuZFxufTtcblxufSgpO1xuLy9pbXBvcnQgLy9cblxudmFyIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9QbGF0Zm9ybSA9IGZ1bmN0aW9uKCkge1xuXG5cbi8vIFBST0dSQU1TXG5cbmZ1bmN0aW9uIGFkZFB1YmxpY01vZHVsZShvYmplY3QsIG5hbWUsIG1haW4pXG57XG5cdHZhciBpbml0ID0gbWFpbiA/IG1ha2VFbWJlZChuYW1lLCBtYWluKSA6IG1haW5Jc1VuZGVmaW5lZChuYW1lKTtcblxuXHRvYmplY3RbJ3dvcmtlciddID0gZnVuY3Rpb24gd29ya2VyKGZsYWdzKVxuXHR7XG5cdFx0cmV0dXJuIGluaXQodW5kZWZpbmVkLCBmbGFncywgZmFsc2UpO1xuXHR9XG5cblx0b2JqZWN0WydlbWJlZCddID0gZnVuY3Rpb24gZW1iZWQoZG9tTm9kZSwgZmxhZ3MpXG5cdHtcblx0XHRyZXR1cm4gaW5pdChkb21Ob2RlLCBmbGFncywgdHJ1ZSk7XG5cdH1cblxuXHRvYmplY3RbJ2Z1bGxzY3JlZW4nXSA9IGZ1bmN0aW9uIGZ1bGxzY3JlZW4oZmxhZ3MpXG5cdHtcblx0XHRyZXR1cm4gaW5pdChkb2N1bWVudC5ib2R5LCBmbGFncywgdHJ1ZSk7XG5cdH07XG59XG5cblxuLy8gUFJPR1JBTSBGQUlMXG5cbmZ1bmN0aW9uIG1haW5Jc1VuZGVmaW5lZChuYW1lKVxue1xuXHRyZXR1cm4gZnVuY3Rpb24oZG9tTm9kZSlcblx0e1xuXHRcdHZhciBtZXNzYWdlID0gJ0Nhbm5vdCBpbml0aWFsaXplIG1vZHVsZSBgJyArIG5hbWUgK1xuXHRcdFx0J2AgYmVjYXVzZSBpdCBoYXMgbm8gYG1haW5gIHZhbHVlIVxcbldoYXQgc2hvdWxkIEkgc2hvdyBvbiBzY3JlZW4/Jztcblx0XHRkb21Ob2RlLmlubmVySFRNTCA9IGVycm9ySHRtbChtZXNzYWdlKTtcblx0XHR0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG5cdH07XG59XG5cbmZ1bmN0aW9uIGVycm9ySHRtbChtZXNzYWdlKVxue1xuXHRyZXR1cm4gJzxkaXYgc3R5bGU9XCJwYWRkaW5nLWxlZnQ6MWVtO1wiPidcblx0XHQrICc8aDIgc3R5bGU9XCJmb250LXdlaWdodDpub3JtYWw7XCI+PGI+T29wcyE8L2I+IFNvbWV0aGluZyB3ZW50IHdyb25nIHdoZW4gc3RhcnRpbmcgeW91ciBFbG0gcHJvZ3JhbS48L2gyPidcblx0XHQrICc8cHJlIHN0eWxlPVwicGFkZGluZy1sZWZ0OjFlbTtcIj4nICsgbWVzc2FnZSArICc8L3ByZT4nXG5cdFx0KyAnPC9kaXY+Jztcbn1cblxuXG4vLyBQUk9HUkFNIFNVQ0NFU1NcblxuZnVuY3Rpb24gbWFrZUVtYmVkKG1vZHVsZU5hbWUsIG1haW4pXG57XG5cdHJldHVybiBmdW5jdGlvbiBlbWJlZChyb290RG9tTm9kZSwgZmxhZ3MsIHdpdGhSZW5kZXJlcilcblx0e1xuXHRcdHRyeVxuXHRcdHtcblx0XHRcdHZhciBwcm9ncmFtID0gbWFpblRvUHJvZ3JhbShtb2R1bGVOYW1lLCBtYWluKTtcblx0XHRcdGlmICghd2l0aFJlbmRlcmVyKVxuXHRcdFx0e1xuXHRcdFx0XHRwcm9ncmFtLnJlbmRlcmVyID0gZHVtbXlSZW5kZXJlcjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBtYWtlRW1iZWRIZWxwKG1vZHVsZU5hbWUsIHByb2dyYW0sIHJvb3REb21Ob2RlLCBmbGFncyk7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblx0XHRcdHJvb3REb21Ob2RlLmlubmVySFRNTCA9IGVycm9ySHRtbChlLm1lc3NhZ2UpO1xuXHRcdFx0dGhyb3cgZTtcblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIGR1bW15UmVuZGVyZXIoKVxue1xuXHRyZXR1cm4geyB1cGRhdGU6IGZ1bmN0aW9uKCkge30gfTtcbn1cblxuXG4vLyBNQUlOIFRPIFBST0dSQU1cblxuZnVuY3Rpb24gbWFpblRvUHJvZ3JhbShtb2R1bGVOYW1lLCB3cmFwcGVkTWFpbilcbntcblx0dmFyIG1haW4gPSB3cmFwcGVkTWFpbi5tYWluO1xuXG5cdGlmICh0eXBlb2YgbWFpbi5pbml0ID09PSAndW5kZWZpbmVkJylcblx0e1xuXHRcdHZhciBlbXB0eUJhZyA9IGJhdGNoKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0Lk5pbCk7XG5cdFx0dmFyIG5vQ2hhbmdlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLlR1cGxlMihcblx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5UdXBsZTAsXG5cdFx0XHRlbXB0eUJhZ1xuXHRcdCk7XG5cblx0XHRyZXR1cm4gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kcHJvZ3JhbVdpdGhGbGFncyh7XG5cdFx0XHRpbml0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG5vQ2hhbmdlOyB9LFxuXHRcdFx0dmlldzogZnVuY3Rpb24oKSB7IHJldHVybiBtYWluOyB9LFxuXHRcdFx0dXBkYXRlOiBGMihmdW5jdGlvbigpIHsgcmV0dXJuIG5vQ2hhbmdlOyB9KSxcblx0XHRcdHN1YnNjcmlwdGlvbnM6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGVtcHR5QmFnOyB9XG5cdFx0fSk7XG5cdH1cblxuXHR2YXIgZmxhZ3MgPSB3cmFwcGVkTWFpbi5mbGFncztcblx0dmFyIGluaXQgPSBmbGFnc1xuXHRcdD8gaW5pdFdpdGhGbGFncyhtb2R1bGVOYW1lLCBtYWluLmluaXQsIGZsYWdzKVxuXHRcdDogaW5pdFdpdGhvdXRGbGFncyhtb2R1bGVOYW1lLCBtYWluLmluaXQpO1xuXG5cdHJldHVybiBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRwcm9ncmFtV2l0aEZsYWdzKHtcblx0XHRpbml0OiBpbml0LFxuXHRcdHZpZXc6IG1haW4udmlldyxcblx0XHR1cGRhdGU6IG1haW4udXBkYXRlLFxuXHRcdHN1YnNjcmlwdGlvbnM6IG1haW4uc3Vic2NyaXB0aW9ucyxcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGluaXRXaXRob3V0RmxhZ3MobW9kdWxlTmFtZSwgcmVhbEluaXQpXG57XG5cdHJldHVybiBmdW5jdGlvbiBpbml0KGZsYWdzKVxuXHR7XG5cdFx0aWYgKHR5cGVvZiBmbGFncyAhPT0gJ3VuZGVmaW5lZCcpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHQnWW91IGFyZSBnaXZpbmcgbW9kdWxlIGAnICsgbW9kdWxlTmFtZSArICdgIGFuIGFyZ3VtZW50IGluIEphdmFTY3JpcHQuXFxuJ1xuXHRcdFx0XHQrICdUaGlzIG1vZHVsZSBkb2VzIG5vdCB0YWtlIGFyZ3VtZW50cyB0aG91Z2ghIFlvdSBwcm9iYWJseSBuZWVkIHRvIGNoYW5nZSB0aGVcXG4nXG5cdFx0XHRcdCsgJ2luaXRpYWxpemF0aW9uIGNvZGUgdG8gc29tZXRoaW5nIGxpa2UgYEVsbS4nICsgbW9kdWxlTmFtZSArICcuZnVsbHNjcmVlbigpYCdcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiByZWFsSW5pdCgpO1xuXHR9O1xufVxuXG5mdW5jdGlvbiBpbml0V2l0aEZsYWdzKG1vZHVsZU5hbWUsIHJlYWxJbml0LCBmbGFnRGVjb2Rlcilcbntcblx0cmV0dXJuIGZ1bmN0aW9uIGluaXQoZmxhZ3MpXG5cdHtcblx0XHR2YXIgcmVzdWx0ID0gQTIoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24ucnVuLCBmbGFnRGVjb2RlciwgZmxhZ3MpO1xuXHRcdGlmIChyZXN1bHQuY3RvciA9PT0gJ0VycicpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHQnWW91IGFyZSB0cnlpbmcgdG8gaW5pdGlhbGl6ZSBtb2R1bGUgYCcgKyBtb2R1bGVOYW1lICsgJ2Agd2l0aCBhbiB1bmV4cGVjdGVkIGFyZ3VtZW50Llxcbidcblx0XHRcdFx0KyAnV2hlbiB0cnlpbmcgdG8gY29udmVydCBpdCB0byBhIHVzYWJsZSBFbG0gdmFsdWUsIEkgcnVuIGludG8gdGhpcyBwcm9ibGVtOlxcblxcbidcblx0XHRcdFx0KyByZXN1bHQuXzBcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiByZWFsSW5pdChyZXN1bHQuXzApO1xuXHR9O1xufVxuXG5cbi8vIFNFVFVQIFJVTlRJTUUgU1lTVEVNXG5cbmZ1bmN0aW9uIG1ha2VFbWJlZEhlbHAobW9kdWxlTmFtZSwgcHJvZ3JhbSwgcm9vdERvbU5vZGUsIGZsYWdzKVxue1xuXHR2YXIgaW5pdCA9IHByb2dyYW0uaW5pdDtcblx0dmFyIHVwZGF0ZSA9IHByb2dyYW0udXBkYXRlO1xuXHR2YXIgc3Vic2NyaXB0aW9ucyA9IHByb2dyYW0uc3Vic2NyaXB0aW9ucztcblx0dmFyIHZpZXcgPSBwcm9ncmFtLnZpZXc7XG5cdHZhciBtYWtlUmVuZGVyZXIgPSBwcm9ncmFtLnJlbmRlcmVyO1xuXG5cdC8vIGFtYmllbnQgc3RhdGVcblx0dmFyIG1hbmFnZXJzID0ge307XG5cdHZhciByZW5kZXJlcjtcblxuXHQvLyBpbml0IGFuZCB1cGRhdGUgc3RhdGUgaW4gbWFpbiBwcm9jZXNzXG5cdHZhciBpbml0QXBwID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1NjaGVkdWxlci5uYXRpdmVCaW5kaW5nKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0dmFyIHJlc3VsdHMgPSBpbml0KGZsYWdzKTtcblx0XHR2YXIgbW9kZWwgPSByZXN1bHRzLl8wO1xuXHRcdHJlbmRlcmVyID0gbWFrZVJlbmRlcmVyKHJvb3REb21Ob2RlLCBlbnF1ZXVlLCB2aWV3KG1vZGVsKSk7XG5cdFx0dmFyIGNtZHMgPSByZXN1bHRzLl8xO1xuXHRcdHZhciBzdWJzID0gc3Vic2NyaXB0aW9ucyhtb2RlbCk7XG5cdFx0ZGlzcGF0Y2hFZmZlY3RzKG1hbmFnZXJzLCBjbWRzLCBzdWJzKTtcblx0XHRjYWxsYmFjayhfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLnN1Y2NlZWQobW9kZWwpKTtcblx0fSk7XG5cblx0ZnVuY3Rpb24gb25NZXNzYWdlKG1zZywgbW9kZWwpXG5cdHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1NjaGVkdWxlci5uYXRpdmVCaW5kaW5nKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgcmVzdWx0cyA9IEEyKHVwZGF0ZSwgbXNnLCBtb2RlbCk7XG5cdFx0XHRtb2RlbCA9IHJlc3VsdHMuXzA7XG5cdFx0XHRyZW5kZXJlci51cGRhdGUodmlldyhtb2RlbCkpO1xuXHRcdFx0dmFyIGNtZHMgPSByZXN1bHRzLl8xO1xuXHRcdFx0dmFyIHN1YnMgPSBzdWJzY3JpcHRpb25zKG1vZGVsKTtcblx0XHRcdGRpc3BhdGNoRWZmZWN0cyhtYW5hZ2VycywgY21kcywgc3Vicyk7XG5cdFx0XHRjYWxsYmFjayhfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLnN1Y2NlZWQobW9kZWwpKTtcblx0XHR9KTtcblx0fVxuXG5cdHZhciBtYWluUHJvY2VzcyA9IHNwYXduTG9vcChpbml0QXBwLCBvbk1lc3NhZ2UpO1xuXG5cdGZ1bmN0aW9uIGVucXVldWUobXNnKVxuXHR7XG5cdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX1NjaGVkdWxlci5yYXdTZW5kKG1haW5Qcm9jZXNzLCBtc2cpO1xuXHR9XG5cblx0dmFyIHBvcnRzID0gc2V0dXBFZmZlY3RzKG1hbmFnZXJzLCBlbnF1ZXVlKTtcblxuXHRyZXR1cm4gcG9ydHMgPyB7IHBvcnRzOiBwb3J0cyB9IDoge307XG59XG5cblxuLy8gRUZGRUNUIE1BTkFHRVJTXG5cbnZhciBlZmZlY3RNYW5hZ2VycyA9IHt9O1xuXG5mdW5jdGlvbiBzZXR1cEVmZmVjdHMobWFuYWdlcnMsIGNhbGxiYWNrKVxue1xuXHR2YXIgcG9ydHM7XG5cblx0Ly8gc2V0dXAgYWxsIG5lY2Vzc2FyeSBlZmZlY3QgbWFuYWdlcnNcblx0Zm9yICh2YXIga2V5IGluIGVmZmVjdE1hbmFnZXJzKVxuXHR7XG5cdFx0dmFyIG1hbmFnZXIgPSBlZmZlY3RNYW5hZ2Vyc1trZXldO1xuXG5cdFx0aWYgKG1hbmFnZXIuaXNGb3JlaWduKVxuXHRcdHtcblx0XHRcdHBvcnRzID0gcG9ydHMgfHwge307XG5cdFx0XHRwb3J0c1trZXldID0gbWFuYWdlci50YWcgPT09ICdjbWQnXG5cdFx0XHRcdD8gc2V0dXBPdXRnb2luZ1BvcnQoa2V5KVxuXHRcdFx0XHQ6IHNldHVwSW5jb21pbmdQb3J0KGtleSwgY2FsbGJhY2spO1xuXHRcdH1cblxuXHRcdG1hbmFnZXJzW2tleV0gPSBtYWtlTWFuYWdlcihtYW5hZ2VyLCBjYWxsYmFjayk7XG5cdH1cblxuXHRyZXR1cm4gcG9ydHM7XG59XG5cbmZ1bmN0aW9uIG1ha2VNYW5hZ2VyKGluZm8sIGNhbGxiYWNrKVxue1xuXHR2YXIgcm91dGVyID0ge1xuXHRcdG1haW46IGNhbGxiYWNrLFxuXHRcdHNlbGY6IHVuZGVmaW5lZFxuXHR9O1xuXG5cdHZhciB0YWcgPSBpbmZvLnRhZztcblx0dmFyIG9uRWZmZWN0cyA9IGluZm8ub25FZmZlY3RzO1xuXHR2YXIgb25TZWxmTXNnID0gaW5mby5vblNlbGZNc2c7XG5cblx0ZnVuY3Rpb24gb25NZXNzYWdlKG1zZywgc3RhdGUpXG5cdHtcblx0XHRpZiAobXNnLmN0b3IgPT09ICdzZWxmJylcblx0XHR7XG5cdFx0XHRyZXR1cm4gQTMob25TZWxmTXNnLCByb3V0ZXIsIG1zZy5fMCwgc3RhdGUpO1xuXHRcdH1cblxuXHRcdHZhciBmeCA9IG1zZy5fMDtcblx0XHRzd2l0Y2ggKHRhZylcblx0XHR7XG5cdFx0XHRjYXNlICdjbWQnOlxuXHRcdFx0XHRyZXR1cm4gQTMob25FZmZlY3RzLCByb3V0ZXIsIGZ4LmNtZHMsIHN0YXRlKTtcblxuXHRcdFx0Y2FzZSAnc3ViJzpcblx0XHRcdFx0cmV0dXJuIEEzKG9uRWZmZWN0cywgcm91dGVyLCBmeC5zdWJzLCBzdGF0ZSk7XG5cblx0XHRcdGNhc2UgJ2Z4Jzpcblx0XHRcdFx0cmV0dXJuIEE0KG9uRWZmZWN0cywgcm91dGVyLCBmeC5jbWRzLCBmeC5zdWJzLCBzdGF0ZSk7XG5cdFx0fVxuXHR9XG5cblx0dmFyIHByb2Nlc3MgPSBzcGF3bkxvb3AoaW5mby5pbml0LCBvbk1lc3NhZ2UpO1xuXHRyb3V0ZXIuc2VsZiA9IHByb2Nlc3M7XG5cdHJldHVybiBwcm9jZXNzO1xufVxuXG5mdW5jdGlvbiBzZW5kVG9BcHAocm91dGVyLCBtc2cpXG57XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLm5hdGl2ZUJpbmRpbmcoZnVuY3Rpb24oY2FsbGJhY2spXG5cdHtcblx0XHRyb3V0ZXIubWFpbihtc2cpO1xuXHRcdGNhbGxiYWNrKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIuc3VjY2VlZChfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuVHVwbGUwKSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzZW5kVG9TZWxmKHJvdXRlciwgbXNnKVxue1xuXHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1NjaGVkdWxlci5zZW5kLCByb3V0ZXIuc2VsZiwge1xuXHRcdGN0b3I6ICdzZWxmJyxcblx0XHRfMDogbXNnXG5cdH0pO1xufVxuXG5cbi8vIEhFTFBFUiBmb3IgU1RBVEVGVUwgTE9PUFNcblxuZnVuY3Rpb24gc3Bhd25Mb29wKGluaXQsIG9uTWVzc2FnZSlcbntcblx0dmFyIGFuZFRoZW4gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLmFuZFRoZW47XG5cblx0ZnVuY3Rpb24gbG9vcChzdGF0ZSlcblx0e1xuXHRcdHZhciBoYW5kbGVNc2cgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLnJlY2VpdmUoZnVuY3Rpb24obXNnKSB7XG5cdFx0XHRyZXR1cm4gb25NZXNzYWdlKG1zZywgc3RhdGUpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBBMihhbmRUaGVuLCBoYW5kbGVNc2csIGxvb3ApO1xuXHR9XG5cblx0dmFyIHRhc2sgPSBBMihhbmRUaGVuLCBpbml0LCBsb29wKTtcblxuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1NjaGVkdWxlci5yYXdTcGF3bih0YXNrKTtcbn1cblxuXG4vLyBCQUdTXG5cbmZ1bmN0aW9uIGxlYWYoaG9tZSlcbntcblx0cmV0dXJuIGZ1bmN0aW9uKHZhbHVlKVxuXHR7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6ICdsZWFmJyxcblx0XHRcdGhvbWU6IGhvbWUsXG5cdFx0XHR2YWx1ZTogdmFsdWVcblx0XHR9O1xuXHR9O1xufVxuXG5mdW5jdGlvbiBiYXRjaChsaXN0KVxue1xuXHRyZXR1cm4ge1xuXHRcdHR5cGU6ICdub2RlJyxcblx0XHRicmFuY2hlczogbGlzdFxuXHR9O1xufVxuXG5mdW5jdGlvbiBtYXAodGFnZ2VyLCBiYWcpXG57XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ21hcCcsXG5cdFx0dGFnZ2VyOiB0YWdnZXIsXG5cdFx0dHJlZTogYmFnXG5cdH1cbn1cblxuXG4vLyBQSVBFIEJBR1MgSU5UTyBFRkZFQ1QgTUFOQUdFUlNcblxuZnVuY3Rpb24gZGlzcGF0Y2hFZmZlY3RzKG1hbmFnZXJzLCBjbWRCYWcsIHN1YkJhZylcbntcblx0dmFyIGVmZmVjdHNEaWN0ID0ge307XG5cdGdhdGhlckVmZmVjdHModHJ1ZSwgY21kQmFnLCBlZmZlY3RzRGljdCwgbnVsbCk7XG5cdGdhdGhlckVmZmVjdHMoZmFsc2UsIHN1YkJhZywgZWZmZWN0c0RpY3QsIG51bGwpO1xuXG5cdGZvciAodmFyIGhvbWUgaW4gbWFuYWdlcnMpXG5cdHtcblx0XHR2YXIgZnggPSBob21lIGluIGVmZmVjdHNEaWN0XG5cdFx0XHQ/IGVmZmVjdHNEaWN0W2hvbWVdXG5cdFx0XHQ6IHtcblx0XHRcdFx0Y21kczogX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuTmlsLFxuXHRcdFx0XHRzdWJzOiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5OaWxcblx0XHRcdH07XG5cblx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLnJhd1NlbmQobWFuYWdlcnNbaG9tZV0sIHsgY3RvcjogJ2Z4JywgXzA6IGZ4IH0pO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdhdGhlckVmZmVjdHMoaXNDbWQsIGJhZywgZWZmZWN0c0RpY3QsIHRhZ2dlcnMpXG57XG5cdHN3aXRjaCAoYmFnLnR5cGUpXG5cdHtcblx0XHRjYXNlICdsZWFmJzpcblx0XHRcdHZhciBob21lID0gYmFnLmhvbWU7XG5cdFx0XHR2YXIgZWZmZWN0ID0gdG9FZmZlY3QoaXNDbWQsIGhvbWUsIHRhZ2dlcnMsIGJhZy52YWx1ZSk7XG5cdFx0XHRlZmZlY3RzRGljdFtob21lXSA9IGluc2VydChpc0NtZCwgZWZmZWN0LCBlZmZlY3RzRGljdFtob21lXSk7XG5cdFx0XHRyZXR1cm47XG5cblx0XHRjYXNlICdub2RlJzpcblx0XHRcdHZhciBsaXN0ID0gYmFnLmJyYW5jaGVzO1xuXHRcdFx0d2hpbGUgKGxpc3QuY3RvciAhPT0gJ1tdJylcblx0XHRcdHtcblx0XHRcdFx0Z2F0aGVyRWZmZWN0cyhpc0NtZCwgbGlzdC5fMCwgZWZmZWN0c0RpY3QsIHRhZ2dlcnMpO1xuXHRcdFx0XHRsaXN0ID0gbGlzdC5fMTtcblx0XHRcdH1cblx0XHRcdHJldHVybjtcblxuXHRcdGNhc2UgJ21hcCc6XG5cdFx0XHRnYXRoZXJFZmZlY3RzKGlzQ21kLCBiYWcudHJlZSwgZWZmZWN0c0RpY3QsIHtcblx0XHRcdFx0dGFnZ2VyOiBiYWcudGFnZ2VyLFxuXHRcdFx0XHRyZXN0OiB0YWdnZXJzXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0fVxufVxuXG5mdW5jdGlvbiB0b0VmZmVjdChpc0NtZCwgaG9tZSwgdGFnZ2VycywgdmFsdWUpXG57XG5cdGZ1bmN0aW9uIGFwcGx5VGFnZ2Vycyh4KVxuXHR7XG5cdFx0dmFyIHRlbXAgPSB0YWdnZXJzO1xuXHRcdHdoaWxlICh0ZW1wKVxuXHRcdHtcblx0XHRcdHggPSB0ZW1wLnRhZ2dlcih4KTtcblx0XHRcdHRlbXAgPSB0ZW1wLnJlc3Q7XG5cdFx0fVxuXHRcdHJldHVybiB4O1xuXHR9XG5cblx0dmFyIG1hcCA9IGlzQ21kXG5cdFx0PyBlZmZlY3RNYW5hZ2Vyc1tob21lXS5jbWRNYXBcblx0XHQ6IGVmZmVjdE1hbmFnZXJzW2hvbWVdLnN1Yk1hcDtcblxuXHRyZXR1cm4gQTIobWFwLCBhcHBseVRhZ2dlcnMsIHZhbHVlKVxufVxuXG5mdW5jdGlvbiBpbnNlcnQoaXNDbWQsIG5ld0VmZmVjdCwgZWZmZWN0cylcbntcblx0ZWZmZWN0cyA9IGVmZmVjdHMgfHwge1xuXHRcdGNtZHM6IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0Lk5pbCxcblx0XHRzdWJzOiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5OaWxcblx0fTtcblx0aWYgKGlzQ21kKVxuXHR7XG5cdFx0ZWZmZWN0cy5jbWRzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuQ29ucyhuZXdFZmZlY3QsIGVmZmVjdHMuY21kcyk7XG5cdFx0cmV0dXJuIGVmZmVjdHM7XG5cdH1cblx0ZWZmZWN0cy5zdWJzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuQ29ucyhuZXdFZmZlY3QsIGVmZmVjdHMuc3Vicyk7XG5cdHJldHVybiBlZmZlY3RzO1xufVxuXG5cbi8vIFBPUlRTXG5cbmZ1bmN0aW9uIGNoZWNrUG9ydE5hbWUobmFtZSlcbntcblx0aWYgKG5hbWUgaW4gZWZmZWN0TWFuYWdlcnMpXG5cdHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ1RoZXJlIGNhbiBvbmx5IGJlIG9uZSBwb3J0IG5hbWVkIGAnICsgbmFtZSArICdgLCBidXQgeW91ciBwcm9ncmFtIGhhcyBtdWx0aXBsZS4nKTtcblx0fVxufVxuXG5cbi8vIE9VVEdPSU5HIFBPUlRTXG5cbmZ1bmN0aW9uIG91dGdvaW5nUG9ydChuYW1lLCBjb252ZXJ0ZXIpXG57XG5cdGNoZWNrUG9ydE5hbWUobmFtZSk7XG5cdGVmZmVjdE1hbmFnZXJzW25hbWVdID0ge1xuXHRcdHRhZzogJ2NtZCcsXG5cdFx0Y21kTWFwOiBvdXRnb2luZ1BvcnRNYXAsXG5cdFx0Y29udmVydGVyOiBjb252ZXJ0ZXIsXG5cdFx0aXNGb3JlaWduOiB0cnVlXG5cdH07XG5cdHJldHVybiBsZWFmKG5hbWUpO1xufVxuXG52YXIgb3V0Z29pbmdQb3J0TWFwID0gRjIoZnVuY3Rpb24gY21kTWFwKHRhZ2dlciwgdmFsdWUpIHtcblx0cmV0dXJuIHZhbHVlO1xufSk7XG5cbmZ1bmN0aW9uIHNldHVwT3V0Z29pbmdQb3J0KG5hbWUpXG57XG5cdHZhciBzdWJzID0gW107XG5cdHZhciBjb252ZXJ0ZXIgPSBlZmZlY3RNYW5hZ2Vyc1tuYW1lXS5jb252ZXJ0ZXI7XG5cblx0Ly8gQ1JFQVRFIE1BTkFHRVJcblxuXHR2YXIgaW5pdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIuc3VjY2VlZChudWxsKTtcblxuXHRmdW5jdGlvbiBvbkVmZmVjdHMocm91dGVyLCBjbWRMaXN0LCBzdGF0ZSlcblx0e1xuXHRcdHdoaWxlIChjbWRMaXN0LmN0b3IgIT09ICdbXScpXG5cdFx0e1xuXHRcdFx0dmFyIHZhbHVlID0gY29udmVydGVyKGNtZExpc3QuXzApO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzdWJzLmxlbmd0aDsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHRzdWJzW2ldKHZhbHVlKTtcblx0XHRcdH1cblx0XHRcdGNtZExpc3QgPSBjbWRMaXN0Ll8xO1xuXHRcdH1cblx0XHRyZXR1cm4gaW5pdDtcblx0fVxuXG5cdGVmZmVjdE1hbmFnZXJzW25hbWVdLmluaXQgPSBpbml0O1xuXHRlZmZlY3RNYW5hZ2Vyc1tuYW1lXS5vbkVmZmVjdHMgPSBGMyhvbkVmZmVjdHMpO1xuXG5cdC8vIFBVQkxJQyBBUElcblxuXHRmdW5jdGlvbiBzdWJzY3JpYmUoY2FsbGJhY2spXG5cdHtcblx0XHRzdWJzLnB1c2goY2FsbGJhY2spO1xuXHR9XG5cblx0ZnVuY3Rpb24gdW5zdWJzY3JpYmUoY2FsbGJhY2spXG5cdHtcblx0XHR2YXIgaW5kZXggPSBzdWJzLmluZGV4T2YoY2FsbGJhY2spO1xuXHRcdGlmIChpbmRleCA+PSAwKVxuXHRcdHtcblx0XHRcdHN1YnMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHN1YnNjcmliZTogc3Vic2NyaWJlLFxuXHRcdHVuc3Vic2NyaWJlOiB1bnN1YnNjcmliZVxuXHR9O1xufVxuXG5cbi8vIElOQ09NSU5HIFBPUlRTXG5cbmZ1bmN0aW9uIGluY29taW5nUG9ydChuYW1lLCBjb252ZXJ0ZXIpXG57XG5cdGNoZWNrUG9ydE5hbWUobmFtZSk7XG5cdGVmZmVjdE1hbmFnZXJzW25hbWVdID0ge1xuXHRcdHRhZzogJ3N1YicsXG5cdFx0c3ViTWFwOiBpbmNvbWluZ1BvcnRNYXAsXG5cdFx0Y29udmVydGVyOiBjb252ZXJ0ZXIsXG5cdFx0aXNGb3JlaWduOiB0cnVlXG5cdH07XG5cdHJldHVybiBsZWFmKG5hbWUpO1xufVxuXG52YXIgaW5jb21pbmdQb3J0TWFwID0gRjIoZnVuY3Rpb24gc3ViTWFwKHRhZ2dlciwgZmluYWxUYWdnZXIpXG57XG5cdHJldHVybiBmdW5jdGlvbih2YWx1ZSlcblx0e1xuXHRcdHJldHVybiB0YWdnZXIoZmluYWxUYWdnZXIodmFsdWUpKTtcblx0fTtcbn0pO1xuXG5mdW5jdGlvbiBzZXR1cEluY29taW5nUG9ydChuYW1lLCBjYWxsYmFjaylcbntcblx0dmFyIHNlbnRCZWZvcmVJbml0ID0gW107XG5cdHZhciBzdWJzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuTmlsO1xuXHR2YXIgY29udmVydGVyID0gZWZmZWN0TWFuYWdlcnNbbmFtZV0uY29udmVydGVyO1xuXHR2YXIgY3VycmVudE9uRWZmZWN0cyA9IHByZUluaXRPbkVmZmVjdHM7XG5cdHZhciBjdXJyZW50U2VuZCA9IHByZUluaXRTZW5kO1xuXG5cdC8vIENSRUFURSBNQU5BR0VSXG5cblx0dmFyIGluaXQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLnN1Y2NlZWQobnVsbCk7XG5cblx0ZnVuY3Rpb24gcHJlSW5pdE9uRWZmZWN0cyhyb3V0ZXIsIHN1Ykxpc3QsIHN0YXRlKVxuXHR7XG5cdFx0dmFyIHBvc3RJbml0UmVzdWx0ID0gcG9zdEluaXRPbkVmZmVjdHMocm91dGVyLCBzdWJMaXN0LCBzdGF0ZSk7XG5cblx0XHRmb3IodmFyIGkgPSAwOyBpIDwgc2VudEJlZm9yZUluaXQubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0cG9zdEluaXRTZW5kKHNlbnRCZWZvcmVJbml0W2ldKTtcblx0XHR9XG5cblx0XHRzZW50QmVmb3JlSW5pdCA9IG51bGw7IC8vIHRvIHJlbGVhc2Ugb2JqZWN0cyBoZWxkIGluIHF1ZXVlXG5cdFx0Y3VycmVudFNlbmQgPSBwb3N0SW5pdFNlbmQ7XG5cdFx0Y3VycmVudE9uRWZmZWN0cyA9IHBvc3RJbml0T25FZmZlY3RzO1xuXHRcdHJldHVybiBwb3N0SW5pdFJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIHBvc3RJbml0T25FZmZlY3RzKHJvdXRlciwgc3ViTGlzdCwgc3RhdGUpXG5cdHtcblx0XHRzdWJzID0gc3ViTGlzdDtcblx0XHRyZXR1cm4gaW5pdDtcblx0fVxuXG5cdGZ1bmN0aW9uIG9uRWZmZWN0cyhyb3V0ZXIsIHN1Ykxpc3QsIHN0YXRlKVxuXHR7XG5cdFx0cmV0dXJuIGN1cnJlbnRPbkVmZmVjdHMocm91dGVyLCBzdWJMaXN0LCBzdGF0ZSk7XG5cdH1cblxuXHRlZmZlY3RNYW5hZ2Vyc1tuYW1lXS5pbml0ID0gaW5pdDtcblx0ZWZmZWN0TWFuYWdlcnNbbmFtZV0ub25FZmZlY3RzID0gRjMob25FZmZlY3RzKTtcblxuXHQvLyBQVUJMSUMgQVBJXG5cblx0ZnVuY3Rpb24gcHJlSW5pdFNlbmQodmFsdWUpXG5cdHtcblx0XHRzZW50QmVmb3JlSW5pdC5wdXNoKHZhbHVlKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHBvc3RJbml0U2VuZChpbmNvbWluZ1ZhbHVlKVxuXHR7XG5cdFx0dmFyIHJlc3VsdCA9IEEyKF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGRlY29kZVZhbHVlLCBjb252ZXJ0ZXIsIGluY29taW5nVmFsdWUpO1xuXHRcdGlmIChyZXN1bHQuY3RvciA9PT0gJ0VycicpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdUcnlpbmcgdG8gc2VuZCBhbiB1bmV4cGVjdGVkIHR5cGUgb2YgdmFsdWUgdGhyb3VnaCBwb3J0IGAnICsgbmFtZSArICdgOlxcbicgKyByZXN1bHQuXzApO1xuXHRcdH1cblxuXHRcdHZhciB2YWx1ZSA9IHJlc3VsdC5fMDtcblx0XHR2YXIgdGVtcCA9IHN1YnM7XG5cdFx0d2hpbGUgKHRlbXAuY3RvciAhPT0gJ1tdJylcblx0XHR7XG5cdFx0XHRjYWxsYmFjayh0ZW1wLl8wKHZhbHVlKSk7XG5cdFx0XHR0ZW1wID0gdGVtcC5fMTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBzZW5kKGluY29taW5nVmFsdWUpXG5cdHtcblx0XHRjdXJyZW50U2VuZChpbmNvbWluZ1ZhbHVlKTtcblx0fVxuXG5cdHJldHVybiB7IHNlbmQ6IHNlbmQgfTtcbn1cblxucmV0dXJuIHtcblx0Ly8gcm91dGVyc1xuXHRzZW5kVG9BcHA6IEYyKHNlbmRUb0FwcCksXG5cdHNlbmRUb1NlbGY6IEYyKHNlbmRUb1NlbGYpLFxuXG5cdC8vIGdsb2JhbCBzZXR1cFxuXHRtYWluVG9Qcm9ncmFtOiBtYWluVG9Qcm9ncmFtLFxuXHRlZmZlY3RNYW5hZ2VyczogZWZmZWN0TWFuYWdlcnMsXG5cdG91dGdvaW5nUG9ydDogb3V0Z29pbmdQb3J0LFxuXHRpbmNvbWluZ1BvcnQ6IGluY29taW5nUG9ydCxcblx0YWRkUHVibGljTW9kdWxlOiBhZGRQdWJsaWNNb2R1bGUsXG5cblx0Ly8gZWZmZWN0IGJhZ3Ncblx0bGVhZjogbGVhZixcblx0YmF0Y2g6IGJhdGNoLFxuXHRtYXA6IEYyKG1hcClcbn07XG5cbn0oKTtcblxudmFyIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtJGhhY2sgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLnN1Y2NlZWQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm0kc2VuZFRvU2VsZiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9QbGF0Zm9ybS5zZW5kVG9TZWxmO1xudmFyIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtJHNlbmRUb0FwcCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9QbGF0Zm9ybS5zZW5kVG9BcHA7XG52YXIgX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm0kUHJvZ3JhbSA9IHtjdG9yOiAnUHJvZ3JhbSd9O1xudmFyIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtJFRhc2sgPSB7Y3RvcjogJ1Rhc2snfTtcbnZhciBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybSRQcm9jZXNzSWQgPSB7Y3RvcjogJ1Byb2Nlc3NJZCd9O1xudmFyIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtJFJvdXRlciA9IHtjdG9yOiAnUm91dGVyJ307XG5cbnZhciBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWQkYmF0Y2ggPSBfZWxtX2xhbmckY29yZSROYXRpdmVfUGxhdGZvcm0uYmF0Y2g7XG52YXIgX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fQ21kJG5vbmUgPSBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWQkYmF0Y2goXG5cdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRbXSkpO1xudmFyIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZF9vcHMgPSBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWRfb3BzIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fQ21kX29wc1snISddID0gRjIoXG5cdGZ1bmN0aW9uIChtb2RlbCwgY29tbWFuZHMpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XzA6IG1vZGVsLFxuXHRcdFx0XzE6IF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZCRiYXRjaChjb21tYW5kcylcblx0XHR9O1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWQkbWFwID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1BsYXRmb3JtLm1hcDtcbnZhciBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWQkQ21kID0ge2N0b3I6ICdDbWQnfTtcblxudmFyIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCR0b01heWJlID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuXHR2YXIgX3AwID0gcmVzdWx0O1xuXHRpZiAoX3AwLmN0b3IgPT09ICdPaycpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkSnVzdChfcDAuXzApO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xuXHR9XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCR3aXRoRGVmYXVsdCA9IEYyKFxuXHRmdW5jdGlvbiAoZGVmLCByZXN1bHQpIHtcblx0XHR2YXIgX3AxID0gcmVzdWx0O1xuXHRcdGlmIChfcDEuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0cmV0dXJuIF9wMS5fMDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGRlZjtcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIgPSBmdW5jdGlvbiAoYSkge1xuXHRyZXR1cm4ge2N0b3I6ICdFcnInLCBfMDogYX07XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRhbmRUaGVuID0gRjIoXG5cdGZ1bmN0aW9uIChyZXN1bHQsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIF9wMiA9IHJlc3VsdDtcblx0XHRpZiAoX3AyLmN0b3IgPT09ICdPaycpIHtcblx0XHRcdHJldHVybiBjYWxsYmFjayhfcDIuXzApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihfcDIuXzApO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkUmVzdWx0JE9rID0gZnVuY3Rpb24gKGEpIHtcblx0cmV0dXJuIHtjdG9yOiAnT2snLCBfMDogYX07XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRtYXAgPSBGMihcblx0ZnVuY3Rpb24gKGZ1bmMsIHJhKSB7XG5cdFx0dmFyIF9wMyA9IHJhO1xuXHRcdGlmIChfcDMuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRPayhcblx0XHRcdFx0ZnVuYyhfcDMuXzApKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoX3AzLl8wKTtcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRtYXAyID0gRjMoXG5cdGZ1bmN0aW9uIChmdW5jLCByYSwgcmIpIHtcblx0XHR2YXIgX3A0ID0ge2N0b3I6ICdfVHVwbGUyJywgXzA6IHJhLCBfMTogcmJ9O1xuXHRcdGlmIChfcDQuXzAuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0aWYgKF9wNC5fMS5jdG9yID09PSAnT2snKSB7XG5cdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkT2soXG5cdFx0XHRcdFx0QTIoZnVuYywgX3A0Ll8wLl8wLCBfcDQuXzEuXzApKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKF9wNC5fMS5fMCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKF9wNC5fMC5fMCk7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRSZXN1bHQkbWFwMyA9IEY0KFxuXHRmdW5jdGlvbiAoZnVuYywgcmEsIHJiLCByYykge1xuXHRcdHZhciBfcDUgPSB7Y3RvcjogJ19UdXBsZTMnLCBfMDogcmEsIF8xOiByYiwgXzI6IHJjfTtcblx0XHRpZiAoX3A1Ll8wLmN0b3IgPT09ICdPaycpIHtcblx0XHRcdGlmIChfcDUuXzEuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0XHRpZiAoX3A1Ll8yLmN0b3IgPT09ICdPaycpIHtcblx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JE9rKFxuXHRcdFx0XHRcdFx0QTMoZnVuYywgX3A1Ll8wLl8wLCBfcDUuXzEuXzAsIF9wNS5fMi5fMCkpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKF9wNS5fMi5fMCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKF9wNS5fMS5fMCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKF9wNS5fMC5fMCk7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRSZXN1bHQkbWFwNCA9IEY1KFxuXHRmdW5jdGlvbiAoZnVuYywgcmEsIHJiLCByYywgcmQpIHtcblx0XHR2YXIgX3A2ID0ge2N0b3I6ICdfVHVwbGU0JywgXzA6IHJhLCBfMTogcmIsIF8yOiByYywgXzM6IHJkfTtcblx0XHRpZiAoX3A2Ll8wLmN0b3IgPT09ICdPaycpIHtcblx0XHRcdGlmIChfcDYuXzEuY3RvciA9PT0gJ09rJykge1xuXHRcdFx0XHRpZiAoX3A2Ll8yLmN0b3IgPT09ICdPaycpIHtcblx0XHRcdFx0XHRpZiAoX3A2Ll8zLmN0b3IgPT09ICdPaycpIHtcblx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkT2soXG5cdFx0XHRcdFx0XHRcdEE0KGZ1bmMsIF9wNi5fMC5fMCwgX3A2Ll8xLl8wLCBfcDYuXzIuXzAsIF9wNi5fMy5fMCkpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihfcDYuXzMuXzApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihfcDYuXzIuXzApO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihfcDYuXzEuXzApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihfcDYuXzAuXzApO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkUmVzdWx0JG1hcDUgPSBGNihcblx0ZnVuY3Rpb24gKGZ1bmMsIHJhLCByYiwgcmMsIHJkLCByZSkge1xuXHRcdHZhciBfcDcgPSB7Y3RvcjogJ19UdXBsZTUnLCBfMDogcmEsIF8xOiByYiwgXzI6IHJjLCBfMzogcmQsIF80OiByZX07XG5cdFx0aWYgKF9wNy5fMC5jdG9yID09PSAnT2snKSB7XG5cdFx0XHRpZiAoX3A3Ll8xLmN0b3IgPT09ICdPaycpIHtcblx0XHRcdFx0aWYgKF9wNy5fMi5jdG9yID09PSAnT2snKSB7XG5cdFx0XHRcdFx0aWYgKF9wNy5fMy5jdG9yID09PSAnT2snKSB7XG5cdFx0XHRcdFx0XHRpZiAoX3A3Ll80LmN0b3IgPT09ICdPaycpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRPayhcblx0XHRcdFx0XHRcdFx0XHRBNShmdW5jLCBfcDcuXzAuXzAsIF9wNy5fMS5fMCwgX3A3Ll8yLl8wLCBfcDcuXzMuXzAsIF9wNy5fNC5fMCkpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoX3A3Ll80Ll8wKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoX3A3Ll8zLl8wKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoX3A3Ll8yLl8wKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoX3A3Ll8xLl8wKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoX3A3Ll8wLl8wKTtcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRmb3JtYXRFcnJvciA9IEYyKFxuXHRmdW5jdGlvbiAoZiwgcmVzdWx0KSB7XG5cdFx0dmFyIF9wOCA9IHJlc3VsdDtcblx0XHRpZiAoX3A4LmN0b3IgPT09ICdPaycpIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkT2soX3A4Ll8wKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoXG5cdFx0XHRcdGYoX3A4Ll8wKSk7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRSZXN1bHQkZnJvbU1heWJlID0gRjIoXG5cdGZ1bmN0aW9uIChlcnIsIG1heWJlKSB7XG5cdFx0dmFyIF9wOSA9IG1heWJlO1xuXHRcdGlmIChfcDkuY3RvciA9PT0gJ0p1c3QnKSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JE9rKF9wOS5fMCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKGVycik7XG5cdFx0fVxuXHR9KTtcblxudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skb25FcnJvciA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TY2hlZHVsZXIub25FcnJvcjtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJGFuZFRoZW4gPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLmFuZFRoZW47XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRzcGF3bkNtZCA9IEYyKFxuXHRmdW5jdGlvbiAocm91dGVyLCBfcDApIHtcblx0XHR2YXIgX3AxID0gX3AwO1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLnNwYXduKFxuXHRcdFx0QTIoXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbixcblx0XHRcdFx0X3AxLl8wLFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSRQbGF0Zm9ybSRzZW5kVG9BcHAocm91dGVyKSkpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJGZhaWwgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLmZhaWw7XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRtYXBFcnJvciA9IEYyKFxuXHRmdW5jdGlvbiAoZiwgdGFzaykge1xuXHRcdHJldHVybiBBMihcblx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skb25FcnJvcixcblx0XHRcdHRhc2ssXG5cdFx0XHRmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRUYXNrJGZhaWwoXG5cdFx0XHRcdFx0ZihlcnIpKTtcblx0XHRcdH0pO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJHN1Y2NlZWQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU2NoZWR1bGVyLnN1Y2NlZWQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRtYXAgPSBGMihcblx0ZnVuY3Rpb24gKGZ1bmMsIHRhc2tBKSB7XG5cdFx0cmV0dXJuIEEyKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0dGFza0EsXG5cdFx0XHRmdW5jdGlvbiAoYSkge1xuXHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRzdWNjZWVkKFxuXHRcdFx0XHRcdGZ1bmMoYSkpO1xuXHRcdFx0fSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skbWFwMiA9IEYzKFxuXHRmdW5jdGlvbiAoZnVuYywgdGFza0EsIHRhc2tCKSB7XG5cdFx0cmV0dXJuIEEyKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0dGFza0EsXG5cdFx0XHRmdW5jdGlvbiAoYSkge1xuXHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0XHRcdHRhc2tCLFxuXHRcdFx0XHRcdGZ1bmN0aW9uIChiKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRzdWNjZWVkKFxuXHRcdFx0XHRcdFx0XHRBMihmdW5jLCBhLCBiKSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRtYXAzID0gRjQoXG5cdGZ1bmN0aW9uIChmdW5jLCB0YXNrQSwgdGFza0IsIHRhc2tDKSB7XG5cdFx0cmV0dXJuIEEyKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0dGFza0EsXG5cdFx0XHRmdW5jdGlvbiAoYSkge1xuXHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0XHRcdHRhc2tCLFxuXHRcdFx0XHRcdGZ1bmN0aW9uIChiKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbixcblx0XHRcdFx0XHRcdFx0dGFza0MsXG5cdFx0XHRcdFx0XHRcdGZ1bmN0aW9uIChjKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFRhc2skc3VjY2VlZChcblx0XHRcdFx0XHRcdFx0XHRcdEEzKGZ1bmMsIGEsIGIsIGMpKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRtYXA0ID0gRjUoXG5cdGZ1bmN0aW9uIChmdW5jLCB0YXNrQSwgdGFza0IsIHRhc2tDLCB0YXNrRCkge1xuXHRcdHJldHVybiBBMihcblx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbixcblx0XHRcdHRhc2tBLFxuXHRcdFx0ZnVuY3Rpb24gKGEpIHtcblx0XHRcdFx0cmV0dXJuIEEyKFxuXHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbixcblx0XHRcdFx0XHR0YXNrQixcblx0XHRcdFx0XHRmdW5jdGlvbiAoYikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIEEyKFxuXHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJGFuZFRoZW4sXG5cdFx0XHRcdFx0XHRcdHRhc2tDLFxuXHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAoYykge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbixcblx0XHRcdFx0XHRcdFx0XHRcdHRhc2tELFxuXHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKGQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFRhc2skc3VjY2VlZChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRBNChmdW5jLCBhLCBiLCBjLCBkKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRtYXA1ID0gRjYoXG5cdGZ1bmN0aW9uIChmdW5jLCB0YXNrQSwgdGFza0IsIHRhc2tDLCB0YXNrRCwgdGFza0UpIHtcblx0XHRyZXR1cm4gQTIoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJGFuZFRoZW4sXG5cdFx0XHR0YXNrQSxcblx0XHRcdGZ1bmN0aW9uIChhKSB7XG5cdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJGFuZFRoZW4sXG5cdFx0XHRcdFx0dGFza0IsXG5cdFx0XHRcdFx0ZnVuY3Rpb24gKGIpIHtcblx0XHRcdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRhbmRUaGVuLFxuXHRcdFx0XHRcdFx0XHR0YXNrQyxcblx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKGMpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJGFuZFRoZW4sXG5cdFx0XHRcdFx0XHRcdFx0XHR0YXNrRCxcblx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uIChkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBBMihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJGFuZFRoZW4sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGFza0UsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRUYXNrJHN1Y2NlZWQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdEE1KGZ1bmMsIGEsIGIsIGMsIGQsIGUpKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJGFuZE1hcCA9IEYyKFxuXHRmdW5jdGlvbiAodGFza0Z1bmMsIHRhc2tWYWx1ZSkge1xuXHRcdHJldHVybiBBMihcblx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbixcblx0XHRcdHRhc2tGdW5jLFxuXHRcdFx0ZnVuY3Rpb24gKGZ1bmMpIHtcblx0XHRcdFx0cmV0dXJuIEEyKFxuXHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skYW5kVGhlbixcblx0XHRcdFx0XHR0YXNrVmFsdWUsXG5cdFx0XHRcdFx0ZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRzdWNjZWVkKFxuXHRcdFx0XHRcdFx0XHRmdW5jKHZhbHVlKSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRzZXF1ZW5jZSA9IGZ1bmN0aW9uICh0YXNrcykge1xuXHR2YXIgX3AyID0gdGFza3M7XG5cdGlmIChfcDIuY3RvciA9PT0gJ1tdJykge1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRUYXNrJHN1Y2NlZWQoXG5cdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFtdKSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIEEzKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRtYXAyLFxuXHRcdFx0RjIoXG5cdFx0XHRcdGZ1bmN0aW9uICh4LCB5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIEEyKF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLCB4LCB5KTtcblx0XHRcdFx0fSksXG5cdFx0XHRfcDIuXzAsXG5cdFx0XHRfZWxtX2xhbmckY29yZSRUYXNrJHNlcXVlbmNlKF9wMi5fMSkpO1xuXHR9XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skb25FZmZlY3RzID0gRjMoXG5cdGZ1bmN0aW9uIChyb3V0ZXIsIGNvbW1hbmRzLCBzdGF0ZSkge1xuXHRcdHJldHVybiBBMihcblx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skbWFwLFxuXHRcdFx0ZnVuY3Rpb24gKF9wMykge1xuXHRcdFx0XHRyZXR1cm4ge2N0b3I6ICdfVHVwbGUwJ307XG5cdFx0XHR9LFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRzZXF1ZW5jZShcblx0XHRcdFx0QTIoXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRtYXAsXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRzcGF3bkNtZChyb3V0ZXIpLFxuXHRcdFx0XHRcdGNvbW1hbmRzKSkpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJHRvTWF5YmUgPSBmdW5jdGlvbiAodGFzaykge1xuXHRyZXR1cm4gQTIoXG5cdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRvbkVycm9yLFxuXHRcdEEyKF9lbG1fbGFuZyRjb3JlJFRhc2skbWFwLCBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0LCB0YXNrKSxcblx0XHRmdW5jdGlvbiAoX3A0KSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRzdWNjZWVkKF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmcpO1xuXHRcdH0pO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJGZyb21NYXliZSA9IEYyKFxuXHRmdW5jdGlvbiAoJGRlZmF1bHQsIG1heWJlKSB7XG5cdFx0dmFyIF9wNSA9IG1heWJlO1xuXHRcdGlmIChfcDUuY3RvciA9PT0gJ0p1c3QnKSB7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRzdWNjZWVkKF9wNS5fMCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRUYXNrJGZhaWwoJGRlZmF1bHQpO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayR0b1Jlc3VsdCA9IGZ1bmN0aW9uICh0YXNrKSB7XG5cdHJldHVybiBBMihcblx0XHRfZWxtX2xhbmckY29yZSRUYXNrJG9uRXJyb3IsXG5cdFx0QTIoX2VsbV9sYW5nJGNvcmUkVGFzayRtYXAsIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRPaywgdGFzayksXG5cdFx0ZnVuY3Rpb24gKG1zZykge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFRhc2skc3VjY2VlZChcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihtc2cpKTtcblx0XHR9KTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRmcm9tUmVzdWx0ID0gZnVuY3Rpb24gKHJlc3VsdCkge1xuXHR2YXIgX3A2ID0gcmVzdWx0O1xuXHRpZiAoX3A2LmN0b3IgPT09ICdPaycpIHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRzdWNjZWVkKF9wNi5fMCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFRhc2skZmFpbChfcDYuXzApO1xuXHR9XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skaW5pdCA9IF9lbG1fbGFuZyRjb3JlJFRhc2skc3VjY2VlZChcblx0e2N0b3I6ICdfVHVwbGUwJ30pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skb25TZWxmTXNnID0gRjMoXG5cdGZ1bmN0aW9uIChfcDksIF9wOCwgX3A3KSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFRhc2skc3VjY2VlZChcblx0XHRcdHtjdG9yOiAnX1R1cGxlMCd9KTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkVGFzayRjb21tYW5kID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1BsYXRmb3JtLmxlYWYoJ1Rhc2snKTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJFQgPSBmdW5jdGlvbiAoYSkge1xuXHRyZXR1cm4ge2N0b3I6ICdUJywgXzA6IGF9O1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRUYXNrJHBlcmZvcm0gPSBGMyhcblx0ZnVuY3Rpb24gKG9uRmFpbCwgb25TdWNjZXNzLCB0YXNrKSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFRhc2skY29tbWFuZChcblx0XHRcdF9lbG1fbGFuZyRjb3JlJFRhc2skVChcblx0XHRcdFx0QTIoXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkVGFzayRvbkVycm9yLFxuXHRcdFx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJFRhc2skbWFwLCBvblN1Y2Nlc3MsIHRhc2spLFxuXHRcdFx0XHRcdGZ1bmN0aW9uICh4KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkVGFzayRzdWNjZWVkKFxuXHRcdFx0XHRcdFx0XHRvbkZhaWwoeCkpO1xuXHRcdFx0XHRcdH0pKSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJFRhc2skY21kTWFwID0gRjIoXG5cdGZ1bmN0aW9uICh0YWdnZXIsIF9wMTApIHtcblx0XHR2YXIgX3AxMSA9IF9wMTA7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFRhc2skVChcblx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJFRhc2skbWFwLCB0YWdnZXIsIF9wMTEuXzApKTtcblx0fSk7XG5fZWxtX2xhbmckY29yZSROYXRpdmVfUGxhdGZvcm0uZWZmZWN0TWFuYWdlcnNbJ1Rhc2snXSA9IHtwa2c6ICdlbG0tbGFuZy9jb3JlJywgaW5pdDogX2VsbV9sYW5nJGNvcmUkVGFzayRpbml0LCBvbkVmZmVjdHM6IF9lbG1fbGFuZyRjb3JlJFRhc2skb25FZmZlY3RzLCBvblNlbGZNc2c6IF9lbG1fbGFuZyRjb3JlJFRhc2skb25TZWxmTXNnLCB0YWc6ICdjbWQnLCBjbWRNYXA6IF9lbG1fbGFuZyRjb3JlJFRhc2skY21kTWFwfTtcblxuLy9pbXBvcnQgTmF0aXZlLlV0aWxzIC8vXG5cbnZhciBfZWxtX2xhbmckY29yZSROYXRpdmVfRGVidWcgPSBmdW5jdGlvbigpIHtcblxuZnVuY3Rpb24gbG9nKHRhZywgdmFsdWUpXG57XG5cdHZhciBtc2cgPSB0YWcgKyAnOiAnICsgX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLnRvU3RyaW5nKHZhbHVlKTtcblx0dmFyIHByb2Nlc3MgPSBwcm9jZXNzIHx8IHt9O1xuXHRpZiAocHJvY2Vzcy5zdGRvdXQpXG5cdHtcblx0XHRwcm9jZXNzLnN0ZG91dC53cml0ZShtc2cpO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGNvbnNvbGUubG9nKG1zZyk7XG5cdH1cblx0cmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiBjcmFzaChtZXNzYWdlKVxue1xuXHR0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG59XG5cbnJldHVybiB7XG5cdGNyYXNoOiBjcmFzaCxcblx0bG9nOiBGMihsb2cpXG59O1xuXG59KCk7XG4vL2ltcG9ydCBNYXliZSwgTmF0aXZlLkxpc3QsIE5hdGl2ZS5VdGlscywgUmVzdWx0IC8vXG5cbnZhciBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nID0gZnVuY3Rpb24oKSB7XG5cbmZ1bmN0aW9uIGlzRW1wdHkoc3RyKVxue1xuXHRyZXR1cm4gc3RyLmxlbmd0aCA9PT0gMDtcbn1cbmZ1bmN0aW9uIGNvbnMoY2hyLCBzdHIpXG57XG5cdHJldHVybiBjaHIgKyBzdHI7XG59XG5mdW5jdGlvbiB1bmNvbnMoc3RyKVxue1xuXHR2YXIgaGQgPSBzdHJbMF07XG5cdGlmIChoZClcblx0e1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0KF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5UdXBsZTIoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocihoZCksIHN0ci5zbGljZSgxKSkpO1xuXHR9XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nO1xufVxuZnVuY3Rpb24gYXBwZW5kKGEsIGIpXG57XG5cdHJldHVybiBhICsgYjtcbn1cbmZ1bmN0aW9uIGNvbmNhdChzdHJzKVxue1xuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QudG9BcnJheShzdHJzKS5qb2luKCcnKTtcbn1cbmZ1bmN0aW9uIGxlbmd0aChzdHIpXG57XG5cdHJldHVybiBzdHIubGVuZ3RoO1xufVxuZnVuY3Rpb24gbWFwKGYsIHN0cilcbntcblx0dmFyIG91dCA9IHN0ci5zcGxpdCgnJyk7XG5cdGZvciAodmFyIGkgPSBvdXQubGVuZ3RoOyBpLS07IClcblx0e1xuXHRcdG91dFtpXSA9IGYoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocihvdXRbaV0pKTtcblx0fVxuXHRyZXR1cm4gb3V0LmpvaW4oJycpO1xufVxuZnVuY3Rpb24gZmlsdGVyKHByZWQsIHN0cilcbntcblx0cmV0dXJuIHN0ci5zcGxpdCgnJykubWFwKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIpLmZpbHRlcihwcmVkKS5qb2luKCcnKTtcbn1cbmZ1bmN0aW9uIHJldmVyc2Uoc3RyKVxue1xuXHRyZXR1cm4gc3RyLnNwbGl0KCcnKS5yZXZlcnNlKCkuam9pbignJyk7XG59XG5mdW5jdGlvbiBmb2xkbChmLCBiLCBzdHIpXG57XG5cdHZhciBsZW4gPSBzdHIubGVuZ3RoO1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuXHR7XG5cdFx0YiA9IEEyKGYsIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoc3RyW2ldKSwgYik7XG5cdH1cblx0cmV0dXJuIGI7XG59XG5mdW5jdGlvbiBmb2xkcihmLCBiLCBzdHIpXG57XG5cdGZvciAodmFyIGkgPSBzdHIubGVuZ3RoOyBpLS07IClcblx0e1xuXHRcdGIgPSBBMihmLCBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY2hyKHN0cltpXSksIGIpO1xuXHR9XG5cdHJldHVybiBiO1xufVxuZnVuY3Rpb24gc3BsaXQoc2VwLCBzdHIpXG57XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoc3RyLnNwbGl0KHNlcCkpO1xufVxuZnVuY3Rpb24gam9pbihzZXAsIHN0cnMpXG57XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC50b0FycmF5KHN0cnMpLmpvaW4oc2VwKTtcbn1cbmZ1bmN0aW9uIHJlcGVhdChuLCBzdHIpXG57XG5cdHZhciByZXN1bHQgPSAnJztcblx0d2hpbGUgKG4gPiAwKVxuXHR7XG5cdFx0aWYgKG4gJiAxKVxuXHRcdHtcblx0XHRcdHJlc3VsdCArPSBzdHI7XG5cdFx0fVxuXHRcdG4gPj49IDEsIHN0ciArPSBzdHI7XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIHNsaWNlKHN0YXJ0LCBlbmQsIHN0cilcbntcblx0cmV0dXJuIHN0ci5zbGljZShzdGFydCwgZW5kKTtcbn1cbmZ1bmN0aW9uIGxlZnQobiwgc3RyKVxue1xuXHRyZXR1cm4gbiA8IDEgPyAnJyA6IHN0ci5zbGljZSgwLCBuKTtcbn1cbmZ1bmN0aW9uIHJpZ2h0KG4sIHN0cilcbntcblx0cmV0dXJuIG4gPCAxID8gJycgOiBzdHIuc2xpY2UoLW4pO1xufVxuZnVuY3Rpb24gZHJvcExlZnQobiwgc3RyKVxue1xuXHRyZXR1cm4gbiA8IDEgPyBzdHIgOiBzdHIuc2xpY2Uobik7XG59XG5mdW5jdGlvbiBkcm9wUmlnaHQobiwgc3RyKVxue1xuXHRyZXR1cm4gbiA8IDEgPyBzdHIgOiBzdHIuc2xpY2UoMCwgLW4pO1xufVxuZnVuY3Rpb24gcGFkKG4sIGNociwgc3RyKVxue1xuXHR2YXIgaGFsZiA9IChuIC0gc3RyLmxlbmd0aCkgLyAyO1xuXHRyZXR1cm4gcmVwZWF0KE1hdGguY2VpbChoYWxmKSwgY2hyKSArIHN0ciArIHJlcGVhdChoYWxmIHwgMCwgY2hyKTtcbn1cbmZ1bmN0aW9uIHBhZFJpZ2h0KG4sIGNociwgc3RyKVxue1xuXHRyZXR1cm4gc3RyICsgcmVwZWF0KG4gLSBzdHIubGVuZ3RoLCBjaHIpO1xufVxuZnVuY3Rpb24gcGFkTGVmdChuLCBjaHIsIHN0cilcbntcblx0cmV0dXJuIHJlcGVhdChuIC0gc3RyLmxlbmd0aCwgY2hyKSArIHN0cjtcbn1cblxuZnVuY3Rpb24gdHJpbShzdHIpXG57XG5cdHJldHVybiBzdHIudHJpbSgpO1xufVxuZnVuY3Rpb24gdHJpbUxlZnQoc3RyKVxue1xuXHRyZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrLywgJycpO1xufVxuZnVuY3Rpb24gdHJpbVJpZ2h0KHN0cilcbntcblx0cmV0dXJuIHN0ci5yZXBsYWNlKC9cXHMrJC8sICcnKTtcbn1cblxuZnVuY3Rpb24gd29yZHMoc3RyKVxue1xuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KHN0ci50cmltKCkuc3BsaXQoL1xccysvZykpO1xufVxuZnVuY3Rpb24gbGluZXMoc3RyKVxue1xuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KHN0ci5zcGxpdCgvXFxyXFxufFxccnxcXG4vZykpO1xufVxuXG5mdW5jdGlvbiB0b1VwcGVyKHN0cilcbntcblx0cmV0dXJuIHN0ci50b1VwcGVyQ2FzZSgpO1xufVxuZnVuY3Rpb24gdG9Mb3dlcihzdHIpXG57XG5cdHJldHVybiBzdHIudG9Mb3dlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gYW55KHByZWQsIHN0cilcbntcblx0Zm9yICh2YXIgaSA9IHN0ci5sZW5ndGg7IGktLTsgKVxuXHR7XG5cdFx0aWYgKHByZWQoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNocihzdHJbaV0pKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gYWxsKHByZWQsIHN0cilcbntcblx0Zm9yICh2YXIgaSA9IHN0ci5sZW5ndGg7IGktLTsgKVxuXHR7XG5cdFx0aWYgKCFwcmVkKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIoc3RyW2ldKSkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gY29udGFpbnMoc3ViLCBzdHIpXG57XG5cdHJldHVybiBzdHIuaW5kZXhPZihzdWIpID4gLTE7XG59XG5mdW5jdGlvbiBzdGFydHNXaXRoKHN1Yiwgc3RyKVxue1xuXHRyZXR1cm4gc3RyLmluZGV4T2Yoc3ViKSA9PT0gMDtcbn1cbmZ1bmN0aW9uIGVuZHNXaXRoKHN1Yiwgc3RyKVxue1xuXHRyZXR1cm4gc3RyLmxlbmd0aCA+PSBzdWIubGVuZ3RoICYmXG5cdFx0c3RyLmxhc3RJbmRleE9mKHN1YikgPT09IHN0ci5sZW5ndGggLSBzdWIubGVuZ3RoO1xufVxuZnVuY3Rpb24gaW5kZXhlcyhzdWIsIHN0cilcbntcblx0dmFyIHN1YkxlbiA9IHN1Yi5sZW5ndGg7XG5cdFxuXHRpZiAoc3ViTGVuIDwgMSlcblx0e1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5OaWw7XG5cdH1cblxuXHR2YXIgaSA9IDA7XG5cdHZhciBpcyA9IFtdO1xuXG5cdHdoaWxlICgoaSA9IHN0ci5pbmRleE9mKHN1YiwgaSkpID4gLTEpXG5cdHtcblx0XHRpcy5wdXNoKGkpO1xuXHRcdGkgPSBpICsgc3ViTGVuO1xuXHR9XHRcblx0XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoaXMpO1xufVxuXG5mdW5jdGlvbiB0b0ludChzKVxue1xuXHR2YXIgbGVuID0gcy5sZW5ndGg7XG5cdGlmIChsZW4gPT09IDApXG5cdHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihcImNvdWxkIG5vdCBjb252ZXJ0IHN0cmluZyAnXCIgKyBzICsgXCInIHRvIGFuIEludFwiICk7XG5cdH1cblx0dmFyIHN0YXJ0ID0gMDtcblx0aWYgKHNbMF0gPT09ICctJylcblx0e1xuXHRcdGlmIChsZW4gPT09IDEpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoXCJjb3VsZCBub3QgY29udmVydCBzdHJpbmcgJ1wiICsgcyArIFwiJyB0byBhbiBJbnRcIiApO1xuXHRcdH1cblx0XHRzdGFydCA9IDE7XG5cdH1cblx0Zm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgbGVuOyArK2kpXG5cdHtcblx0XHR2YXIgYyA9IHNbaV07XG5cdFx0aWYgKGMgPCAnMCcgfHwgJzknIDwgYylcblx0XHR7XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihcImNvdWxkIG5vdCBjb252ZXJ0IHN0cmluZyAnXCIgKyBzICsgXCInIHRvIGFuIEludFwiICk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkT2socGFyc2VJbnQocywgMTApKTtcbn1cblxuZnVuY3Rpb24gdG9GbG9hdChzKVxue1xuXHR2YXIgbGVuID0gcy5sZW5ndGg7XG5cdGlmIChsZW4gPT09IDApXG5cdHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycihcImNvdWxkIG5vdCBjb252ZXJ0IHN0cmluZyAnXCIgKyBzICsgXCInIHRvIGEgRmxvYXRcIiApO1xuXHR9XG5cdHZhciBzdGFydCA9IDA7XG5cdGlmIChzWzBdID09PSAnLScpXG5cdHtcblx0XHRpZiAobGVuID09PSAxKVxuXHRcdHtcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRSZXN1bHQkRXJyKFwiY291bGQgbm90IGNvbnZlcnQgc3RyaW5nICdcIiArIHMgKyBcIicgdG8gYSBGbG9hdFwiICk7XG5cdFx0fVxuXHRcdHN0YXJ0ID0gMTtcblx0fVxuXHR2YXIgZG90Q291bnQgPSAwO1xuXHRmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBsZW47ICsraSlcblx0e1xuXHRcdHZhciBjID0gc1tpXTtcblx0XHRpZiAoJzAnIDw9IGMgJiYgYyA8PSAnOScpXG5cdFx0e1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXHRcdGlmIChjID09PSAnLicpXG5cdFx0e1xuXHRcdFx0ZG90Q291bnQgKz0gMTtcblx0XHRcdGlmIChkb3RDb3VudCA8PSAxKVxuXHRcdFx0e1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoXCJjb3VsZCBub3QgY29udmVydCBzdHJpbmcgJ1wiICsgcyArIFwiJyB0byBhIEZsb2F0XCIgKTtcblx0fVxuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JE9rKHBhcnNlRmxvYXQocykpO1xufVxuXG5mdW5jdGlvbiB0b0xpc3Qoc3RyKVxue1xuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KHN0ci5zcGxpdCgnJykubWFwKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5jaHIpKTtcbn1cbmZ1bmN0aW9uIGZyb21MaXN0KGNoYXJzKVxue1xuXHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QudG9BcnJheShjaGFycykuam9pbignJyk7XG59XG5cbnJldHVybiB7XG5cdGlzRW1wdHk6IGlzRW1wdHksXG5cdGNvbnM6IEYyKGNvbnMpLFxuXHR1bmNvbnM6IHVuY29ucyxcblx0YXBwZW5kOiBGMihhcHBlbmQpLFxuXHRjb25jYXQ6IGNvbmNhdCxcblx0bGVuZ3RoOiBsZW5ndGgsXG5cdG1hcDogRjIobWFwKSxcblx0ZmlsdGVyOiBGMihmaWx0ZXIpLFxuXHRyZXZlcnNlOiByZXZlcnNlLFxuXHRmb2xkbDogRjMoZm9sZGwpLFxuXHRmb2xkcjogRjMoZm9sZHIpLFxuXG5cdHNwbGl0OiBGMihzcGxpdCksXG5cdGpvaW46IEYyKGpvaW4pLFxuXHRyZXBlYXQ6IEYyKHJlcGVhdCksXG5cblx0c2xpY2U6IEYzKHNsaWNlKSxcblx0bGVmdDogRjIobGVmdCksXG5cdHJpZ2h0OiBGMihyaWdodCksXG5cdGRyb3BMZWZ0OiBGMihkcm9wTGVmdCksXG5cdGRyb3BSaWdodDogRjIoZHJvcFJpZ2h0KSxcblxuXHRwYWQ6IEYzKHBhZCksXG5cdHBhZExlZnQ6IEYzKHBhZExlZnQpLFxuXHRwYWRSaWdodDogRjMocGFkUmlnaHQpLFxuXG5cdHRyaW06IHRyaW0sXG5cdHRyaW1MZWZ0OiB0cmltTGVmdCxcblx0dHJpbVJpZ2h0OiB0cmltUmlnaHQsXG5cblx0d29yZHM6IHdvcmRzLFxuXHRsaW5lczogbGluZXMsXG5cblx0dG9VcHBlcjogdG9VcHBlcixcblx0dG9Mb3dlcjogdG9Mb3dlcixcblxuXHRhbnk6IEYyKGFueSksXG5cdGFsbDogRjIoYWxsKSxcblxuXHRjb250YWluczogRjIoY29udGFpbnMpLFxuXHRzdGFydHNXaXRoOiBGMihzdGFydHNXaXRoKSxcblx0ZW5kc1dpdGg6IEYyKGVuZHNXaXRoKSxcblx0aW5kZXhlczogRjIoaW5kZXhlcyksXG5cblx0dG9JbnQ6IHRvSW50LFxuXHR0b0Zsb2F0OiB0b0Zsb2F0LFxuXHR0b0xpc3Q6IHRvTGlzdCxcblx0ZnJvbUxpc3Q6IGZyb21MaXN0XG59O1xuXG59KCk7XG5cbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckZnJvbUxpc3QgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmZyb21MaXN0O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyR0b0xpc3QgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLnRvTGlzdDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckdG9GbG9hdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcudG9GbG9hdDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckdG9JbnQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLnRvSW50O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRpbmRpY2VzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5pbmRleGVzO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRpbmRleGVzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5pbmRleGVzO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRlbmRzV2l0aCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcuZW5kc1dpdGg7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHN0YXJ0c1dpdGggPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLnN0YXJ0c1dpdGg7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGNvbnRhaW5zID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5jb250YWlucztcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckYWxsID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5hbGw7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGFueSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcuYW55O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyR0b0xvd2VyID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy50b0xvd2VyO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyR0b1VwcGVyID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy50b1VwcGVyO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRsaW5lcyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcubGluZXM7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHdvcmRzID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy53b3JkcztcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckdHJpbVJpZ2h0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy50cmltUmlnaHQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHRyaW1MZWZ0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy50cmltTGVmdDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckdHJpbSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcudHJpbTtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckcGFkUmlnaHQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLnBhZFJpZ2h0O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRwYWRMZWZ0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5wYWRMZWZ0O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRwYWQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLnBhZDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckZHJvcFJpZ2h0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5kcm9wUmlnaHQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGRyb3BMZWZ0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5kcm9wTGVmdDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckcmlnaHQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLnJpZ2h0O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRsZWZ0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5sZWZ0O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRzbGljZSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcuc2xpY2U7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHJlcGVhdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcucmVwZWF0O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRqb2luID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5qb2luO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRzcGxpdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcuc3BsaXQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGZvbGRyID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5mb2xkcjtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckZm9sZGwgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmZvbGRsO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRyZXZlcnNlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5yZXZlcnNlO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRmaWx0ZXIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmZpbHRlcjtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckbWFwID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5tYXA7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGxlbmd0aCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcubGVuZ3RoO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRjb25jYXQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfU3RyaW5nLmNvbmNhdDtcbnZhciBfZWxtX2xhbmckY29yZSRTdHJpbmckYXBwZW5kID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5hcHBlbmQ7XG52YXIgX2VsbV9sYW5nJGNvcmUkU3RyaW5nJHVuY29ucyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9TdHJpbmcudW5jb25zO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRjb25zID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5jb25zO1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRmcm9tQ2hhciA9IGZ1bmN0aW9uICgkY2hhcikge1xuXHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkU3RyaW5nJGNvbnMsICRjaGFyLCAnJyk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJFN0cmluZyRpc0VtcHR5ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1N0cmluZy5pc0VtcHR5O1xuXG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRmb2xkciA9IEYzKFxuXHRmdW5jdGlvbiAoZiwgYWNjLCB0KSB7XG5cdFx0Zm9sZHI6XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdHZhciBfcDAgPSB0O1xuXHRcdFx0aWYgKF9wMC5jdG9yID09PSAnUkJFbXB0eV9lbG1fYnVpbHRpbicpIHtcblx0XHRcdFx0cmV0dXJuIGFjYztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBfdjEgPSBmLFxuXHRcdFx0XHRcdF92MiA9IEEzKFxuXHRcdFx0XHRcdGYsXG5cdFx0XHRcdFx0X3AwLl8xLFxuXHRcdFx0XHRcdF9wMC5fMixcblx0XHRcdFx0XHRBMyhfZWxtX2xhbmckY29yZSREaWN0JGZvbGRyLCBmLCBhY2MsIF9wMC5fNCkpLFxuXHRcdFx0XHRcdF92MyA9IF9wMC5fMztcblx0XHRcdFx0ZiA9IF92MTtcblx0XHRcdFx0YWNjID0gX3YyO1xuXHRcdFx0XHR0ID0gX3YzO1xuXHRcdFx0XHRjb250aW51ZSBmb2xkcjtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3Qka2V5cyA9IGZ1bmN0aW9uIChkaWN0KSB7XG5cdHJldHVybiBBMyhcblx0XHRfZWxtX2xhbmckY29yZSREaWN0JGZvbGRyLFxuXHRcdEYzKFxuXHRcdFx0ZnVuY3Rpb24gKGtleSwgdmFsdWUsIGtleUxpc3QpIHtcblx0XHRcdFx0cmV0dXJuIEEyKF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLCBrZXksIGtleUxpc3QpO1xuXHRcdFx0fSksXG5cdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0W10pLFxuXHRcdGRpY3QpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JHZhbHVlcyA9IGZ1bmN0aW9uIChkaWN0KSB7XG5cdHJldHVybiBBMyhcblx0XHRfZWxtX2xhbmckY29yZSREaWN0JGZvbGRyLFxuXHRcdEYzKFxuXHRcdFx0ZnVuY3Rpb24gKGtleSwgdmFsdWUsIHZhbHVlTGlzdCkge1xuXHRcdFx0XHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIHZhbHVlLCB2YWx1ZUxpc3QpO1xuXHRcdFx0fSksXG5cdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0W10pLFxuXHRcdGRpY3QpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JHRvTGlzdCA9IGZ1bmN0aW9uIChkaWN0KSB7XG5cdHJldHVybiBBMyhcblx0XHRfZWxtX2xhbmckY29yZSREaWN0JGZvbGRyLFxuXHRcdEYzKFxuXHRcdFx0ZnVuY3Rpb24gKGtleSwgdmFsdWUsIGxpc3QpIHtcblx0XHRcdFx0cmV0dXJuIEEyKFxuXHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3Rfb3BzWyc6OiddLFxuXHRcdFx0XHRcdHtjdG9yOiAnX1R1cGxlMicsIF8wOiBrZXksIF8xOiB2YWx1ZX0sXG5cdFx0XHRcdFx0bGlzdCk7XG5cdFx0XHR9KSxcblx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRbXSksXG5cdFx0ZGljdCk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkZm9sZGwgPSBGMyhcblx0ZnVuY3Rpb24gKGYsIGFjYywgZGljdCkge1xuXHRcdGZvbGRsOlxuXHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHR2YXIgX3AxID0gZGljdDtcblx0XHRcdGlmIChfcDEuY3RvciA9PT0gJ1JCRW1wdHlfZWxtX2J1aWx0aW4nKSB7XG5cdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgX3Y1ID0gZixcblx0XHRcdFx0XHRfdjYgPSBBMyhcblx0XHRcdFx0XHRmLFxuXHRcdFx0XHRcdF9wMS5fMSxcblx0XHRcdFx0XHRfcDEuXzIsXG5cdFx0XHRcdFx0QTMoX2VsbV9sYW5nJGNvcmUkRGljdCRmb2xkbCwgZiwgYWNjLCBfcDEuXzMpKSxcblx0XHRcdFx0XHRfdjcgPSBfcDEuXzQ7XG5cdFx0XHRcdGYgPSBfdjU7XG5cdFx0XHRcdGFjYyA9IF92Njtcblx0XHRcdFx0ZGljdCA9IF92Nztcblx0XHRcdFx0Y29udGludWUgZm9sZGw7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JG1lcmdlID0gRjYoXG5cdGZ1bmN0aW9uIChsZWZ0U3RlcCwgYm90aFN0ZXAsIHJpZ2h0U3RlcCwgbGVmdERpY3QsIHJpZ2h0RGljdCwgaW5pdGlhbFJlc3VsdCkge1xuXHRcdHZhciBzdGVwU3RhdGUgPSBGMyhcblx0XHRcdGZ1bmN0aW9uIChyS2V5LCByVmFsdWUsIF9wMikge1xuXHRcdFx0XHRzdGVwU3RhdGU6XG5cdFx0XHRcdHdoaWxlICh0cnVlKSB7XG5cdFx0XHRcdFx0dmFyIF9wMyA9IF9wMjtcblx0XHRcdFx0XHR2YXIgX3A5ID0gX3AzLl8xO1xuXHRcdFx0XHRcdHZhciBfcDggPSBfcDMuXzA7XG5cdFx0XHRcdFx0dmFyIF9wNCA9IF9wODtcblx0XHRcdFx0XHRpZiAoX3A0LmN0b3IgPT09ICdbXScpIHtcblx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRcdFx0XzA6IF9wOCxcblx0XHRcdFx0XHRcdFx0XzE6IEEzKHJpZ2h0U3RlcCwgcktleSwgclZhbHVlLCBfcDkpXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR2YXIgX3A3ID0gX3A0Ll8xO1xuXHRcdFx0XHRcdFx0dmFyIF9wNiA9IF9wNC5fMC5fMTtcblx0XHRcdFx0XHRcdHZhciBfcDUgPSBfcDQuXzAuXzA7XG5cdFx0XHRcdFx0XHRpZiAoX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmNtcChfcDUsIHJLZXkpIDwgMCkge1xuXHRcdFx0XHRcdFx0XHR2YXIgX3YxMCA9IHJLZXksXG5cdFx0XHRcdFx0XHRcdFx0X3YxMSA9IHJWYWx1ZSxcblx0XHRcdFx0XHRcdFx0XHRfdjEyID0ge1xuXHRcdFx0XHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRcdFx0XHRfMDogX3A3LFxuXHRcdFx0XHRcdFx0XHRcdF8xOiBBMyhsZWZ0U3RlcCwgX3A1LCBfcDYsIF9wOSlcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0cktleSA9IF92MTA7XG5cdFx0XHRcdFx0XHRcdHJWYWx1ZSA9IF92MTE7XG5cdFx0XHRcdFx0XHRcdF9wMiA9IF92MTI7XG5cdFx0XHRcdFx0XHRcdGNvbnRpbnVlIHN0ZXBTdGF0ZTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGlmIChfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuY21wKF9wNSwgcktleSkgPiAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRcdFx0XHRcdF8wOiBfcDgsXG5cdFx0XHRcdFx0XHRcdFx0XHRfMTogQTMocmlnaHRTdGVwLCByS2V5LCByVmFsdWUsIF9wOSlcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XHRcdFx0XHRfMDogX3A3LFxuXHRcdFx0XHRcdFx0XHRcdFx0XzE6IEE0KGJvdGhTdGVwLCBfcDUsIF9wNiwgclZhbHVlLCBfcDkpXG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0dmFyIF9wMTAgPSBBMyhcblx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkZm9sZGwsXG5cdFx0XHRzdGVwU3RhdGUsXG5cdFx0XHR7XG5cdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XzA6IF9lbG1fbGFuZyRjb3JlJERpY3QkdG9MaXN0KGxlZnREaWN0KSxcblx0XHRcdFx0XzE6IGluaXRpYWxSZXN1bHRcblx0XHRcdH0sXG5cdFx0XHRyaWdodERpY3QpO1xuXHRcdHZhciBsZWZ0b3ZlcnMgPSBfcDEwLl8wO1xuXHRcdHZhciBpbnRlcm1lZGlhdGVSZXN1bHQgPSBfcDEwLl8xO1xuXHRcdHJldHVybiBBMyhcblx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZm9sZGwsXG5cdFx0XHRGMihcblx0XHRcdFx0ZnVuY3Rpb24gKF9wMTEsIHJlc3VsdCkge1xuXHRcdFx0XHRcdHZhciBfcDEyID0gX3AxMTtcblx0XHRcdFx0XHRyZXR1cm4gQTMobGVmdFN0ZXAsIF9wMTIuXzAsIF9wMTIuXzEsIHJlc3VsdCk7XG5cdFx0XHRcdH0pLFxuXHRcdFx0aW50ZXJtZWRpYXRlUmVzdWx0LFxuXHRcdFx0bGVmdG92ZXJzKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRyZXBvcnRSZW1CdWcgPSBGNChcblx0ZnVuY3Rpb24gKG1zZywgYywgbGdvdCwgcmdvdCkge1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfRGVidWcuY3Jhc2goXG5cdFx0XHRfZWxtX2xhbmckY29yZSRTdHJpbmckY29uY2F0KFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0J0ludGVybmFsIHJlZC1ibGFjayB0cmVlIGludmFyaWFudCB2aW9sYXRlZCwgZXhwZWN0ZWQgJyxcblx0XHRcdFx0XHRcdG1zZyxcblx0XHRcdFx0XHRcdCcgYW5kIGdvdCAnLFxuXHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkQmFzaWNzJHRvU3RyaW5nKGMpLFxuXHRcdFx0XHRcdFx0Jy8nLFxuXHRcdFx0XHRcdFx0bGdvdCxcblx0XHRcdFx0XHRcdCcvJyxcblx0XHRcdFx0XHRcdHJnb3QsXG5cdFx0XHRcdFx0XHQnXFxuUGxlYXNlIHJlcG9ydCB0aGlzIGJ1ZyB0byA8aHR0cHM6Ly9naXRodWIuY29tL2VsbS1sYW5nL2NvcmUvaXNzdWVzPidcblx0XHRcdFx0XHRdKSkpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGlzQkJsYWNrID0gZnVuY3Rpb24gKGRpY3QpIHtcblx0dmFyIF9wMTMgPSBkaWN0O1xuXHRfdjE0XzI6XG5cdGRvIHtcblx0XHRpZiAoX3AxMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykge1xuXHRcdFx0aWYgKF9wMTMuXzAuY3RvciA9PT0gJ0JCbGFjaycpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRicmVhayBfdjE0XzI7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChfcDEzLl8wLmN0b3IgPT09ICdMQkJsYWNrJykge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGJyZWFrIF92MTRfMjtcblx0XHRcdH1cblx0XHR9XG5cdH0gd2hpbGUoZmFsc2UpO1xuXHRyZXR1cm4gZmFsc2U7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3Qkc2l6ZUhlbHAgPSBGMihcblx0ZnVuY3Rpb24gKG4sIGRpY3QpIHtcblx0XHRzaXplSGVscDpcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0dmFyIF9wMTQgPSBkaWN0O1xuXHRcdFx0aWYgKF9wMTQuY3RvciA9PT0gJ1JCRW1wdHlfZWxtX2J1aWx0aW4nKSB7XG5cdFx0XHRcdHJldHVybiBuO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIF92MTYgPSBBMihfZWxtX2xhbmckY29yZSREaWN0JHNpemVIZWxwLCBuICsgMSwgX3AxNC5fNCksXG5cdFx0XHRcdFx0X3YxNyA9IF9wMTQuXzM7XG5cdFx0XHRcdG4gPSBfdjE2O1xuXHRcdFx0XHRkaWN0ID0gX3YxNztcblx0XHRcdFx0Y29udGludWUgc2l6ZUhlbHA7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JHNpemUgPSBmdW5jdGlvbiAoZGljdCkge1xuXHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkRGljdCRzaXplSGVscCwgMCwgZGljdCk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkZ2V0ID0gRjIoXG5cdGZ1bmN0aW9uICh0YXJnZXRLZXksIGRpY3QpIHtcblx0XHRnZXQ6XG5cdFx0d2hpbGUgKHRydWUpIHtcblx0XHRcdHZhciBfcDE1ID0gZGljdDtcblx0XHRcdGlmIChfcDE1LmN0b3IgPT09ICdSQkVtcHR5X2VsbV9idWlsdGluJykge1xuXHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBfcDE2ID0gQTIoX2VsbV9sYW5nJGNvcmUkQmFzaWNzJGNvbXBhcmUsIHRhcmdldEtleSwgX3AxNS5fMSk7XG5cdFx0XHRcdHN3aXRjaCAoX3AxNi5jdG9yKSB7XG5cdFx0XHRcdFx0Y2FzZSAnTFQnOlxuXHRcdFx0XHRcdFx0dmFyIF92MjAgPSB0YXJnZXRLZXksXG5cdFx0XHRcdFx0XHRcdF92MjEgPSBfcDE1Ll8zO1xuXHRcdFx0XHRcdFx0dGFyZ2V0S2V5ID0gX3YyMDtcblx0XHRcdFx0XHRcdGRpY3QgPSBfdjIxO1xuXHRcdFx0XHRcdFx0Y29udGludWUgZ2V0O1xuXHRcdFx0XHRcdGNhc2UgJ0VRJzpcblx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0KF9wMTUuXzIpO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHR2YXIgX3YyMiA9IHRhcmdldEtleSxcblx0XHRcdFx0XHRcdFx0X3YyMyA9IF9wMTUuXzQ7XG5cdFx0XHRcdFx0XHR0YXJnZXRLZXkgPSBfdjIyO1xuXHRcdFx0XHRcdFx0ZGljdCA9IF92MjM7XG5cdFx0XHRcdFx0XHRjb250aW51ZSBnZXQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkbWVtYmVyID0gRjIoXG5cdGZ1bmN0aW9uIChrZXksIGRpY3QpIHtcblx0XHR2YXIgX3AxNyA9IEEyKF9lbG1fbGFuZyRjb3JlJERpY3QkZ2V0LCBrZXksIGRpY3QpO1xuXHRcdGlmIChfcDE3LmN0b3IgPT09ICdKdXN0Jykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkbWF4V2l0aERlZmF1bHQgPSBGMyhcblx0ZnVuY3Rpb24gKGssIHYsIHIpIHtcblx0XHRtYXhXaXRoRGVmYXVsdDpcblx0XHR3aGlsZSAodHJ1ZSkge1xuXHRcdFx0dmFyIF9wMTggPSByO1xuXHRcdFx0aWYgKF9wMTguY3RvciA9PT0gJ1JCRW1wdHlfZWxtX2J1aWx0aW4nKSB7XG5cdFx0XHRcdHJldHVybiB7Y3RvcjogJ19UdXBsZTInLCBfMDogaywgXzE6IHZ9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIF92MjYgPSBfcDE4Ll8xLFxuXHRcdFx0XHRcdF92MjcgPSBfcDE4Ll8yLFxuXHRcdFx0XHRcdF92MjggPSBfcDE4Ll80O1xuXHRcdFx0XHRrID0gX3YyNjtcblx0XHRcdFx0diA9IF92Mjc7XG5cdFx0XHRcdHIgPSBfdjI4O1xuXHRcdFx0XHRjb250aW51ZSBtYXhXaXRoRGVmYXVsdDtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkTkJsYWNrID0ge2N0b3I6ICdOQmxhY2snfTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JEJCbGFjayA9IHtjdG9yOiAnQkJsYWNrJ307XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRCbGFjayA9IHtjdG9yOiAnQmxhY2snfTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGJsYWNraXNoID0gZnVuY3Rpb24gKHQpIHtcblx0dmFyIF9wMTkgPSB0O1xuXHRpZiAoX3AxOS5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykge1xuXHRcdHZhciBfcDIwID0gX3AxOS5fMDtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLmVxKF9wMjAsIF9lbG1fbGFuZyRjb3JlJERpY3QkQmxhY2spIHx8IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5lcShfcDIwLCBfZWxtX2xhbmckY29yZSREaWN0JEJCbGFjayk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRSZWQgPSB7Y3RvcjogJ1JlZCd9O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkbW9yZUJsYWNrID0gZnVuY3Rpb24gKGNvbG9yKSB7XG5cdHZhciBfcDIxID0gY29sb3I7XG5cdHN3aXRjaCAoX3AyMS5jdG9yKSB7XG5cdFx0Y2FzZSAnQmxhY2snOlxuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkQkJsYWNrO1xuXHRcdGNhc2UgJ1JlZCc6XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkRGljdCRCbGFjaztcblx0XHRjYXNlICdOQmxhY2snOlxuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkUmVkO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0RlYnVnLmNyYXNoKCdDYW5cXCd0IG1ha2UgYSBkb3VibGUgYmxhY2sgbm9kZSBtb3JlIGJsYWNrIScpO1xuXHR9XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkbGVzc0JsYWNrID0gZnVuY3Rpb24gKGNvbG9yKSB7XG5cdHZhciBfcDIyID0gY29sb3I7XG5cdHN3aXRjaCAoX3AyMi5jdG9yKSB7XG5cdFx0Y2FzZSAnQkJsYWNrJzpcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSREaWN0JEJsYWNrO1xuXHRcdGNhc2UgJ0JsYWNrJzpcblx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSREaWN0JFJlZDtcblx0XHRjYXNlICdSZWQnOlxuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkTkJsYWNrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0RlYnVnLmNyYXNoKCdDYW5cXCd0IG1ha2UgYSBuZWdhdGl2ZSBibGFjayBub2RlIGxlc3MgYmxhY2shJyk7XG5cdH1cbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRMQkJsYWNrID0ge2N0b3I6ICdMQkJsYWNrJ307XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRMQmxhY2sgPSB7Y3RvcjogJ0xCbGFjayd9O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkUkJFbXB0eV9lbG1fYnVpbHRpbiA9IGZ1bmN0aW9uIChhKSB7XG5cdHJldHVybiB7Y3RvcjogJ1JCRW1wdHlfZWxtX2J1aWx0aW4nLCBfMDogYX07XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkZW1wdHkgPSBfZWxtX2xhbmckY29yZSREaWN0JFJCRW1wdHlfZWxtX2J1aWx0aW4oX2VsbV9sYW5nJGNvcmUkRGljdCRMQmxhY2spO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkaXNFbXB0eSA9IGZ1bmN0aW9uIChkaWN0KSB7XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMuZXEoZGljdCwgX2VsbV9sYW5nJGNvcmUkRGljdCRlbXB0eSk7XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluID0gRjUoXG5cdGZ1bmN0aW9uIChhLCBiLCBjLCBkLCBlKSB7XG5cdFx0cmV0dXJuIHtjdG9yOiAnUkJOb2RlX2VsbV9idWlsdGluJywgXzA6IGEsIF8xOiBiLCBfMjogYywgXzM6IGQsIF80OiBlfTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRlbnN1cmVCbGFja1Jvb3QgPSBmdW5jdGlvbiAoZGljdCkge1xuXHR2YXIgX3AyMyA9IGRpY3Q7XG5cdGlmICgoX3AyMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykgJiYgKF9wMjMuXzAuY3RvciA9PT0gJ1JlZCcpKSB7XG5cdFx0cmV0dXJuIEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLCBfZWxtX2xhbmckY29yZSREaWN0JEJsYWNrLCBfcDIzLl8xLCBfcDIzLl8yLCBfcDIzLl8zLCBfcDIzLl80KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZGljdDtcblx0fVxufTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGxlc3NCbGFja1RyZWUgPSBmdW5jdGlvbiAoZGljdCkge1xuXHR2YXIgX3AyNCA9IGRpY3Q7XG5cdGlmIChfcDI0LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSB7XG5cdFx0cmV0dXJuIEE1KFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sXG5cdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JGxlc3NCbGFjayhfcDI0Ll8wKSxcblx0XHRcdF9wMjQuXzEsXG5cdFx0XHRfcDI0Ll8yLFxuXHRcdFx0X3AyNC5fMyxcblx0XHRcdF9wMjQuXzQpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSREaWN0JFJCRW1wdHlfZWxtX2J1aWx0aW4oX2VsbV9sYW5nJGNvcmUkRGljdCRMQmxhY2spO1xuXHR9XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkYmFsYW5jZWRUcmVlID0gZnVuY3Rpb24gKGNvbCkge1xuXHRyZXR1cm4gZnVuY3Rpb24gKHhrKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICh4dikge1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICh5aykge1xuXHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24gKHl2KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uICh6aykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uICh6dikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24gKGEpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24gKGIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbiAoYykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24gKGQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gQTUoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JFJCTm9kZV9lbG1fYnVpbHRpbixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkbGVzc0JsYWNrKGNvbCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR5ayxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHl2LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0QTUoX2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sIF9lbG1fbGFuZyRjb3JlJERpY3QkQmxhY2ssIHhrLCB4diwgYSwgYiksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRBNShfZWxtX2xhbmckY29yZSREaWN0JFJCTm9kZV9lbG1fYnVpbHRpbiwgX2VsbV9sYW5nJGNvcmUkRGljdCRCbGFjaywgemssIHp2LCBjLCBkKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH07XG5cdFx0XHR9O1xuXHRcdH07XG5cdH07XG59O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkYmxhY2tlbiA9IGZ1bmN0aW9uICh0KSB7XG5cdHZhciBfcDI1ID0gdDtcblx0aWYgKF9wMjUuY3RvciA9PT0gJ1JCRW1wdHlfZWxtX2J1aWx0aW4nKSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkUkJFbXB0eV9lbG1fYnVpbHRpbihfZWxtX2xhbmckY29yZSREaWN0JExCbGFjayk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLCBfZWxtX2xhbmckY29yZSREaWN0JEJsYWNrLCBfcDI1Ll8xLCBfcDI1Ll8yLCBfcDI1Ll8zLCBfcDI1Ll80KTtcblx0fVxufTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JHJlZGRlbiA9IGZ1bmN0aW9uICh0KSB7XG5cdHZhciBfcDI2ID0gdDtcblx0aWYgKF9wMjYuY3RvciA9PT0gJ1JCRW1wdHlfZWxtX2J1aWx0aW4nKSB7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9EZWJ1Zy5jcmFzaCgnY2FuXFwndCBtYWtlIGEgTGVhZiByZWQnKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gQTUoX2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sIF9lbG1fbGFuZyRjb3JlJERpY3QkUmVkLCBfcDI2Ll8xLCBfcDI2Ll8yLCBfcDI2Ll8zLCBfcDI2Ll80KTtcblx0fVxufTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGJhbGFuY2VIZWxwID0gZnVuY3Rpb24gKHRyZWUpIHtcblx0dmFyIF9wMjcgPSB0cmVlO1xuXHRfdjM2XzY6XG5cdGRvIHtcblx0XHRfdjM2XzU6XG5cdFx0ZG8ge1xuXHRcdFx0X3YzNl80OlxuXHRcdFx0ZG8ge1xuXHRcdFx0XHRfdjM2XzM6XG5cdFx0XHRcdGRvIHtcblx0XHRcdFx0XHRfdjM2XzI6XG5cdFx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdFx0X3YzNl8xOlxuXHRcdFx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdFx0XHRfdjM2XzA6XG5cdFx0XHRcdFx0XHRcdGRvIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoX3AyNy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKF9wMjcuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKF9wMjcuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzd2l0Y2ggKF9wMjcuXzMuXzAuY3Rvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSAnUmVkJzpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChfcDI3Ll80Ll8wLmN0b3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlICdSZWQnOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDI3Ll8zLl8zLmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fMy5fMy5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl8wO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDI3Ll8zLl80LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fMy5fNC5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzE7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDI3Ll80Ll8zLmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fNC5fMy5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfMjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDI3Ll80Ll80LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fNC5fNC5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl8zO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl82O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgJ05CbGFjayc6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKF9wMjcuXzMuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpICYmIChfcDI3Ll8zLl8zLl8wLmN0b3IgPT09ICdSZWQnKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKF9wMjcuXzMuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpICYmIChfcDI3Ll8zLl80Ll8wLmN0b3IgPT09ICdSZWQnKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfMTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKCgoKF9wMjcuXzAuY3RvciA9PT0gJ0JCbGFjaycpICYmIChfcDI3Ll80Ll8zLmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSkgJiYgKF9wMjcuXzQuXzMuXzAuY3RvciA9PT0gJ0JsYWNrJykpICYmIChfcDI3Ll80Ll80LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSkgJiYgKF9wMjcuXzQuXzQuXzAuY3RvciA9PT0gJ0JsYWNrJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl82O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKF9wMjcuXzMuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpICYmIChfcDI3Ll8zLl8zLl8wLmN0b3IgPT09ICdSZWQnKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKF9wMjcuXzMuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpICYmIChfcDI3Ll8zLl80Ll8wLmN0b3IgPT09ICdSZWQnKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfMTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSAnTkJsYWNrJzpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChfcDI3Ll80Ll8wLmN0b3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlICdSZWQnOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDI3Ll80Ll8zLmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fNC5fMy5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl8yO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKChfcDI3Ll80Ll80LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fNC5fNC5fMC5jdG9yID09PSAnUmVkJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzM7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCgoKChfcDI3Ll8wLmN0b3IgPT09ICdCQmxhY2snKSAmJiAoX3AyNy5fMy5fMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykpICYmIChfcDI3Ll8zLl8zLl8wLmN0b3IgPT09ICdCbGFjaycpKSAmJiAoX3AyNy5fMy5fNC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykpICYmIChfcDI3Ll8zLl80Ll8wLmN0b3IgPT09ICdCbGFjaycpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYXNlICdOQmxhY2snOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKF9wMjcuXzAuY3RvciA9PT0gJ0JCbGFjaycpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCgoKF9wMjcuXzQuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpICYmIChfcDI3Ll80Ll8zLl8wLmN0b3IgPT09ICdCbGFjaycpKSAmJiAoX3AyNy5fNC5fNC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykpICYmIChfcDI3Ll80Ll80Ll8wLmN0b3IgPT09ICdCbGFjaycpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl80O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoKChfcDI3Ll8zLl8zLmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSAmJiAoX3AyNy5fMy5fMy5fMC5jdG9yID09PSAnQmxhY2snKSkgJiYgKF9wMjcuXzMuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpKSAmJiAoX3AyNy5fMy5fNC5fMC5jdG9yID09PSAnQmxhY2snKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl81O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoKCgoX3AyNy5fMC5jdG9yID09PSAnQkJsYWNrJykgJiYgKF9wMjcuXzMuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpKSAmJiAoX3AyNy5fMy5fMy5fMC5jdG9yID09PSAnQmxhY2snKSkgJiYgKF9wMjcuXzMuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpKSAmJiAoX3AyNy5fMy5fNC5fMC5jdG9yID09PSAnQmxhY2snKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN3aXRjaCAoX3AyNy5fNC5fMC5jdG9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FzZSAnUmVkJzpcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoX3AyNy5fNC5fMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykgJiYgKF9wMjcuXzQuXzMuXzAuY3RvciA9PT0gJ1JlZCcpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfMjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoX3AyNy5fNC5fNC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykgJiYgKF9wMjcuXzQuXzQuXzAuY3RvciA9PT0gJ1JlZCcpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl8zO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgJ05CbGFjayc6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoKCgoKF9wMjcuXzAuY3RvciA9PT0gJ0JCbGFjaycpICYmIChfcDI3Ll80Ll8zLmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSkgJiYgKF9wMjcuXzQuXzMuXzAuY3RvciA9PT0gJ0JsYWNrJykpICYmIChfcDI3Ll80Ll80LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSkgJiYgKF9wMjcuXzQuXzQuXzAuY3RvciA9PT0gJ0JsYWNrJykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl80O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl82O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChfcDI3Ll8zLl8wLmN0b3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgJ1JlZCc6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoX3AyNy5fMy5fMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykgJiYgKF9wMjcuXzMuXzMuXzAuY3RvciA9PT0gJ1JlZCcpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl8wO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoX3AyNy5fMy5fNC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykgJiYgKF9wMjcuXzMuXzQuXzAuY3RvciA9PT0gJ1JlZCcpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzE7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgJ05CbGFjayc6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoKCgoX3AyNy5fMC5jdG9yID09PSAnQkJsYWNrJykgJiYgKF9wMjcuXzMuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpKSAmJiAoX3AyNy5fMy5fMy5fMC5jdG9yID09PSAnQmxhY2snKSkgJiYgKF9wMjcuXzMuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpKSAmJiAoX3AyNy5fMy5fNC5fMC5jdG9yID09PSAnQmxhY2snKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChfcDI3Ll80LmN0b3IgPT09ICdSQk5vZGVfZWxtX2J1aWx0aW4nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3dpdGNoIChfcDI3Ll80Ll8wLmN0b3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgJ1JlZCc6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoX3AyNy5fNC5fMy5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykgJiYgKF9wMjcuXzQuXzMuXzAuY3RvciA9PT0gJ1JlZCcpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl8yO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoX3AyNy5fNC5fNC5jdG9yID09PSAnUkJOb2RlX2VsbV9idWlsdGluJykgJiYgKF9wMjcuXzQuXzQuXzAuY3RvciA9PT0gJ1JlZCcpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzM7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhc2UgJ05CbGFjayc6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmICgoKCgoX3AyNy5fMC5jdG9yID09PSAnQkJsYWNrJykgJiYgKF9wMjcuXzQuXzMuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpKSAmJiAoX3AyNy5fNC5fMy5fMC5jdG9yID09PSAnQmxhY2snKSkgJiYgKF9wMjcuXzQuXzQuY3RvciA9PT0gJ1JCTm9kZV9lbG1fYnVpbHRpbicpKSAmJiAoX3AyNy5fNC5fNC5fMC5jdG9yID09PSAnQmxhY2snKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBfdjM2XzY7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWsgX3YzNl82O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrIF92MzZfNjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0gd2hpbGUoZmFsc2UpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkRGljdCRiYWxhbmNlZFRyZWUoX3AyNy5fMCkoX3AyNy5fMy5fMy5fMSkoX3AyNy5fMy5fMy5fMikoX3AyNy5fMy5fMSkoX3AyNy5fMy5fMikoX3AyNy5fMSkoX3AyNy5fMikoX3AyNy5fMy5fMy5fMykoX3AyNy5fMy5fMy5fNCkoX3AyNy5fMy5fNCkoX3AyNy5fNCk7XG5cdFx0XHRcdFx0XHR9IHdoaWxlKGZhbHNlKTtcblx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSREaWN0JGJhbGFuY2VkVHJlZShfcDI3Ll8wKShfcDI3Ll8zLl8xKShfcDI3Ll8zLl8yKShfcDI3Ll8zLl80Ll8xKShfcDI3Ll8zLl80Ll8yKShfcDI3Ll8xKShfcDI3Ll8yKShfcDI3Ll8zLl8zKShfcDI3Ll8zLl80Ll8zKShfcDI3Ll8zLl80Ll80KShfcDI3Ll80KTtcblx0XHRcdFx0XHR9IHdoaWxlKGZhbHNlKTtcblx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkRGljdCRiYWxhbmNlZFRyZWUoX3AyNy5fMCkoX3AyNy5fMSkoX3AyNy5fMikoX3AyNy5fNC5fMy5fMSkoX3AyNy5fNC5fMy5fMikoX3AyNy5fNC5fMSkoX3AyNy5fNC5fMikoX3AyNy5fMykoX3AyNy5fNC5fMy5fMykoX3AyNy5fNC5fMy5fNCkoX3AyNy5fNC5fNCk7XG5cdFx0XHRcdH0gd2hpbGUoZmFsc2UpO1xuXHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkRGljdCRiYWxhbmNlZFRyZWUoX3AyNy5fMCkoX3AyNy5fMSkoX3AyNy5fMikoX3AyNy5fNC5fMSkoX3AyNy5fNC5fMikoX3AyNy5fNC5fNC5fMSkoX3AyNy5fNC5fNC5fMikoX3AyNy5fMykoX3AyNy5fNC5fMykoX3AyNy5fNC5fNC5fMykoX3AyNy5fNC5fNC5fNCk7XG5cdFx0XHR9IHdoaWxlKGZhbHNlKTtcblx0XHRcdHJldHVybiBBNShcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkQmxhY2ssXG5cdFx0XHRcdF9wMjcuXzQuXzMuXzEsXG5cdFx0XHRcdF9wMjcuXzQuXzMuXzIsXG5cdFx0XHRcdEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLCBfZWxtX2xhbmckY29yZSREaWN0JEJsYWNrLCBfcDI3Ll8xLCBfcDI3Ll8yLCBfcDI3Ll8zLCBfcDI3Ll80Ll8zLl8zKSxcblx0XHRcdFx0QTUoXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRiYWxhbmNlLFxuXHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkQmxhY2ssXG5cdFx0XHRcdFx0X3AyNy5fNC5fMSxcblx0XHRcdFx0XHRfcDI3Ll80Ll8yLFxuXHRcdFx0XHRcdF9wMjcuXzQuXzMuXzQsXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRyZWRkZW4oX3AyNy5fNC5fNCkpKTtcblx0XHR9IHdoaWxlKGZhbHNlKTtcblx0XHRyZXR1cm4gQTUoXG5cdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JFJCTm9kZV9lbG1fYnVpbHRpbixcblx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkQmxhY2ssXG5cdFx0XHRfcDI3Ll8zLl80Ll8xLFxuXHRcdFx0X3AyNy5fMy5fNC5fMixcblx0XHRcdEE1KFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JGJhbGFuY2UsXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkQmxhY2ssXG5cdFx0XHRcdF9wMjcuXzMuXzEsXG5cdFx0XHRcdF9wMjcuXzMuXzIsXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkcmVkZGVuKF9wMjcuXzMuXzMpLFxuXHRcdFx0XHRfcDI3Ll8zLl80Ll8zKSxcblx0XHRcdEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLCBfZWxtX2xhbmckY29yZSREaWN0JEJsYWNrLCBfcDI3Ll8xLCBfcDI3Ll8yLCBfcDI3Ll8zLl80Ll80LCBfcDI3Ll80KSk7XG5cdH0gd2hpbGUoZmFsc2UpO1xuXHRyZXR1cm4gdHJlZTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRiYWxhbmNlID0gRjUoXG5cdGZ1bmN0aW9uIChjLCBrLCB2LCBsLCByKSB7XG5cdFx0dmFyIHRyZWUgPSBBNShfZWxtX2xhbmckY29yZSREaWN0JFJCTm9kZV9lbG1fYnVpbHRpbiwgYywgaywgdiwgbCwgcik7XG5cdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkYmxhY2tpc2godHJlZSkgPyBfZWxtX2xhbmckY29yZSREaWN0JGJhbGFuY2VIZWxwKHRyZWUpIDogdHJlZTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRidWJibGUgPSBGNShcblx0ZnVuY3Rpb24gKGMsIGssIHYsIGwsIHIpIHtcblx0XHRyZXR1cm4gKF9lbG1fbGFuZyRjb3JlJERpY3QkaXNCQmxhY2sobCkgfHwgX2VsbV9sYW5nJGNvcmUkRGljdCRpc0JCbGFjayhyKSkgPyBBNShcblx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkYmFsYW5jZSxcblx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkbW9yZUJsYWNrKGMpLFxuXHRcdFx0ayxcblx0XHRcdHYsXG5cdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JGxlc3NCbGFja1RyZWUobCksXG5cdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JGxlc3NCbGFja1RyZWUocikpIDogQTUoX2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sIGMsIGssIHYsIGwsIHIpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JHJlbW92ZU1heCA9IEY1KFxuXHRmdW5jdGlvbiAoYywgaywgdiwgbCwgcikge1xuXHRcdHZhciBfcDI4ID0gcjtcblx0XHRpZiAoX3AyOC5jdG9yID09PSAnUkJFbXB0eV9lbG1fYnVpbHRpbicpIHtcblx0XHRcdHJldHVybiBBMyhfZWxtX2xhbmckY29yZSREaWN0JHJlbSwgYywgbCwgcik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBBNShcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRidWJibGUsXG5cdFx0XHRcdGMsXG5cdFx0XHRcdGssXG5cdFx0XHRcdHYsXG5cdFx0XHRcdGwsXG5cdFx0XHRcdEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkcmVtb3ZlTWF4LCBfcDI4Ll8wLCBfcDI4Ll8xLCBfcDI4Ll8yLCBfcDI4Ll8zLCBfcDI4Ll80KSk7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JHJlbSA9IEYzKFxuXHRmdW5jdGlvbiAoYywgbCwgcikge1xuXHRcdHZhciBfcDI5ID0ge2N0b3I6ICdfVHVwbGUyJywgXzA6IGwsIF8xOiByfTtcblx0XHRpZiAoX3AyOS5fMC5jdG9yID09PSAnUkJFbXB0eV9lbG1fYnVpbHRpbicpIHtcblx0XHRcdGlmIChfcDI5Ll8xLmN0b3IgPT09ICdSQkVtcHR5X2VsbV9idWlsdGluJykge1xuXHRcdFx0XHR2YXIgX3AzMCA9IGM7XG5cdFx0XHRcdHN3aXRjaCAoX3AzMC5jdG9yKSB7XG5cdFx0XHRcdFx0Y2FzZSAnUmVkJzpcblx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSREaWN0JFJCRW1wdHlfZWxtX2J1aWx0aW4oX2VsbV9sYW5nJGNvcmUkRGljdCRMQmxhY2spO1xuXHRcdFx0XHRcdGNhc2UgJ0JsYWNrJzpcblx0XHRcdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSREaWN0JFJCRW1wdHlfZWxtX2J1aWx0aW4oX2VsbV9sYW5nJGNvcmUkRGljdCRMQkJsYWNrKTtcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9EZWJ1Zy5jcmFzaCgnY2Fubm90IGhhdmUgYmJsYWNrIG9yIG5ibGFjayBub2RlcyBhdCB0aGlzIHBvaW50Jyk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhciBfcDMzID0gX3AyOS5fMS5fMDtcblx0XHRcdFx0dmFyIF9wMzIgPSBfcDI5Ll8wLl8wO1xuXHRcdFx0XHR2YXIgX3AzMSA9IHtjdG9yOiAnX1R1cGxlMycsIF8wOiBjLCBfMTogX3AzMiwgXzI6IF9wMzN9O1xuXHRcdFx0XHRpZiAoKCgoX3AzMS5jdG9yID09PSAnX1R1cGxlMycpICYmIChfcDMxLl8wLmN0b3IgPT09ICdCbGFjaycpKSAmJiAoX3AzMS5fMS5jdG9yID09PSAnTEJsYWNrJykpICYmIChfcDMxLl8yLmN0b3IgPT09ICdSZWQnKSkge1xuXHRcdFx0XHRcdHJldHVybiBBNShfZWxtX2xhbmckY29yZSREaWN0JFJCTm9kZV9lbG1fYnVpbHRpbiwgX2VsbV9sYW5nJGNvcmUkRGljdCRCbGFjaywgX3AyOS5fMS5fMSwgX3AyOS5fMS5fMiwgX3AyOS5fMS5fMywgX3AyOS5fMS5fNCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIEE0KFxuXHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRyZXBvcnRSZW1CdWcsXG5cdFx0XHRcdFx0XHQnQmxhY2svTEJsYWNrL1JlZCcsXG5cdFx0XHRcdFx0XHRjLFxuXHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkQmFzaWNzJHRvU3RyaW5nKF9wMzIpLFxuXHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkQmFzaWNzJHRvU3RyaW5nKF9wMzMpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoX3AyOS5fMS5jdG9yID09PSAnUkJFbXB0eV9lbG1fYnVpbHRpbicpIHtcblx0XHRcdFx0dmFyIF9wMzYgPSBfcDI5Ll8xLl8wO1xuXHRcdFx0XHR2YXIgX3AzNSA9IF9wMjkuXzAuXzA7XG5cdFx0XHRcdHZhciBfcDM0ID0ge2N0b3I6ICdfVHVwbGUzJywgXzA6IGMsIF8xOiBfcDM1LCBfMjogX3AzNn07XG5cdFx0XHRcdGlmICgoKChfcDM0LmN0b3IgPT09ICdfVHVwbGUzJykgJiYgKF9wMzQuXzAuY3RvciA9PT0gJ0JsYWNrJykpICYmIChfcDM0Ll8xLmN0b3IgPT09ICdSZWQnKSkgJiYgKF9wMzQuXzIuY3RvciA9PT0gJ0xCbGFjaycpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLCBfZWxtX2xhbmckY29yZSREaWN0JEJsYWNrLCBfcDI5Ll8wLl8xLCBfcDI5Ll8wLl8yLCBfcDI5Ll8wLl8zLCBfcDI5Ll8wLl80KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gQTQoXG5cdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JHJlcG9ydFJlbUJ1Zyxcblx0XHRcdFx0XHRcdCdCbGFjay9SZWQvTEJsYWNrJyxcblx0XHRcdFx0XHRcdGMsXG5cdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRCYXNpY3MkdG9TdHJpbmcoX3AzNSksXG5cdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRCYXNpY3MkdG9TdHJpbmcoX3AzNikpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgX3A0MCA9IF9wMjkuXzAuXzI7XG5cdFx0XHRcdHZhciBfcDM5ID0gX3AyOS5fMC5fNDtcblx0XHRcdFx0dmFyIF9wMzggPSBfcDI5Ll8wLl8xO1xuXHRcdFx0XHR2YXIgbCQgPSBBNShfZWxtX2xhbmckY29yZSREaWN0JHJlbW92ZU1heCwgX3AyOS5fMC5fMCwgX3AzOCwgX3A0MCwgX3AyOS5fMC5fMywgX3AzOSk7XG5cdFx0XHRcdHZhciBfcDM3ID0gQTMoX2VsbV9sYW5nJGNvcmUkRGljdCRtYXhXaXRoRGVmYXVsdCwgX3AzOCwgX3A0MCwgX3AzOSk7XG5cdFx0XHRcdHZhciBrID0gX3AzNy5fMDtcblx0XHRcdFx0dmFyIHYgPSBfcDM3Ll8xO1xuXHRcdFx0XHRyZXR1cm4gQTUoX2VsbV9sYW5nJGNvcmUkRGljdCRidWJibGUsIGMsIGssIHYsIGwkLCByKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkbWFwID0gRjIoXG5cdGZ1bmN0aW9uIChmLCBkaWN0KSB7XG5cdFx0dmFyIF9wNDEgPSBkaWN0O1xuXHRcdGlmIChfcDQxLmN0b3IgPT09ICdSQkVtcHR5X2VsbV9idWlsdGluJykge1xuXHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkUkJFbXB0eV9lbG1fYnVpbHRpbihfZWxtX2xhbmckY29yZSREaWN0JExCbGFjayk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBfcDQyID0gX3A0MS5fMTtcblx0XHRcdHJldHVybiBBNShcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRSQk5vZGVfZWxtX2J1aWx0aW4sXG5cdFx0XHRcdF9wNDEuXzAsXG5cdFx0XHRcdF9wNDIsXG5cdFx0XHRcdEEyKGYsIF9wNDIsIF9wNDEuXzIpLFxuXHRcdFx0XHRBMihfZWxtX2xhbmckY29yZSREaWN0JG1hcCwgZiwgX3A0MS5fMyksXG5cdFx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJERpY3QkbWFwLCBmLCBfcDQxLl80KSk7XG5cdFx0fVxuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JFNhbWUgPSB7Y3RvcjogJ1NhbWUnfTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JFJlbW92ZSA9IHtjdG9yOiAnUmVtb3ZlJ307XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRJbnNlcnQgPSB7Y3RvcjogJ0luc2VydCd9O1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkdXBkYXRlID0gRjMoXG5cdGZ1bmN0aW9uIChrLCBhbHRlciwgZGljdCkge1xuXHRcdHZhciB1cCA9IGZ1bmN0aW9uIChkaWN0KSB7XG5cdFx0XHR2YXIgX3A0MyA9IGRpY3Q7XG5cdFx0XHRpZiAoX3A0My5jdG9yID09PSAnUkJFbXB0eV9lbG1fYnVpbHRpbicpIHtcblx0XHRcdFx0dmFyIF9wNDQgPSBhbHRlcihfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nKTtcblx0XHRcdFx0aWYgKF9wNDQuY3RvciA9PT0gJ05vdGhpbmcnKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtjdG9yOiAnX1R1cGxlMicsIF8wOiBfZWxtX2xhbmckY29yZSREaWN0JFNhbWUsIF8xOiBfZWxtX2xhbmckY29yZSREaWN0JGVtcHR5fTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdFx0XzA6IF9lbG1fbGFuZyRjb3JlJERpY3QkSW5zZXJ0LFxuXHRcdFx0XHRcdFx0XzE6IEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLCBfZWxtX2xhbmckY29yZSREaWN0JFJlZCwgaywgX3A0NC5fMCwgX2VsbV9sYW5nJGNvcmUkRGljdCRlbXB0eSwgX2VsbV9sYW5nJGNvcmUkRGljdCRlbXB0eSlcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgX3A1NSA9IF9wNDMuXzI7XG5cdFx0XHRcdHZhciBfcDU0ID0gX3A0My5fNDtcblx0XHRcdFx0dmFyIF9wNTMgPSBfcDQzLl8zO1xuXHRcdFx0XHR2YXIgX3A1MiA9IF9wNDMuXzE7XG5cdFx0XHRcdHZhciBfcDUxID0gX3A0My5fMDtcblx0XHRcdFx0dmFyIF9wNDUgPSBBMihfZWxtX2xhbmckY29yZSRCYXNpY3MkY29tcGFyZSwgaywgX3A1Mik7XG5cdFx0XHRcdHN3aXRjaCAoX3A0NS5jdG9yKSB7XG5cdFx0XHRcdFx0Y2FzZSAnRVEnOlxuXHRcdFx0XHRcdFx0dmFyIF9wNDYgPSBhbHRlcihcblx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTWF5YmUkSnVzdChfcDU1KSk7XG5cdFx0XHRcdFx0XHRpZiAoX3A0Ni5jdG9yID09PSAnTm90aGluZycpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XHRcdFx0XzA6IF9lbG1fbGFuZyRjb3JlJERpY3QkUmVtb3ZlLFxuXHRcdFx0XHRcdFx0XHRcdF8xOiBBMyhfZWxtX2xhbmckY29yZSREaWN0JHJlbSwgX3A1MSwgX3A1MywgX3A1NClcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdFx0XHRcdF8wOiBfZWxtX2xhbmckY29yZSREaWN0JFNhbWUsXG5cdFx0XHRcdFx0XHRcdFx0XzE6IEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLCBfcDUxLCBfcDUyLCBfcDQ2Ll8wLCBfcDUzLCBfcDU0KVxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhc2UgJ0xUJzpcblx0XHRcdFx0XHRcdHZhciBfcDQ3ID0gdXAoX3A1Myk7XG5cdFx0XHRcdFx0XHR2YXIgZmxhZyA9IF9wNDcuXzA7XG5cdFx0XHRcdFx0XHR2YXIgbmV3TGVmdCA9IF9wNDcuXzE7XG5cdFx0XHRcdFx0XHR2YXIgX3A0OCA9IGZsYWc7XG5cdFx0XHRcdFx0XHRzd2l0Y2ggKF9wNDguY3Rvcikge1xuXHRcdFx0XHRcdFx0XHRjYXNlICdTYW1lJzpcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdFx0XHRcdFx0XzA6IF9lbG1fbGFuZyRjb3JlJERpY3QkU2FtZSxcblx0XHRcdFx0XHRcdFx0XHRcdF8xOiBBNShfZWxtX2xhbmckY29yZSREaWN0JFJCTm9kZV9lbG1fYnVpbHRpbiwgX3A1MSwgX3A1MiwgX3A1NSwgbmV3TGVmdCwgX3A1NClcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRjYXNlICdJbnNlcnQnOlxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XHRcdFx0XHRfMDogX2VsbV9sYW5nJGNvcmUkRGljdCRJbnNlcnQsXG5cdFx0XHRcdFx0XHRcdFx0XHRfMTogQTUoX2VsbV9sYW5nJGNvcmUkRGljdCRiYWxhbmNlLCBfcDUxLCBfcDUyLCBfcDU1LCBuZXdMZWZ0LCBfcDU0KVxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRcdFx0XHRcdF8wOiBfZWxtX2xhbmckY29yZSREaWN0JFJlbW92ZSxcblx0XHRcdFx0XHRcdFx0XHRcdF8xOiBBNShfZWxtX2xhbmckY29yZSREaWN0JGJ1YmJsZSwgX3A1MSwgX3A1MiwgX3A1NSwgbmV3TGVmdCwgX3A1NClcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHR2YXIgX3A0OSA9IHVwKF9wNTQpO1xuXHRcdFx0XHRcdFx0dmFyIGZsYWcgPSBfcDQ5Ll8wO1xuXHRcdFx0XHRcdFx0dmFyIG5ld1JpZ2h0ID0gX3A0OS5fMTtcblx0XHRcdFx0XHRcdHZhciBfcDUwID0gZmxhZztcblx0XHRcdFx0XHRcdHN3aXRjaCAoX3A1MC5jdG9yKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgJ1NhbWUnOlxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XHRcdFx0XHRfMDogX2VsbV9sYW5nJGNvcmUkRGljdCRTYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XzE6IEE1KF9lbG1fbGFuZyRjb3JlJERpY3QkUkJOb2RlX2VsbV9idWlsdGluLCBfcDUxLCBfcDUyLCBfcDU1LCBfcDUzLCBuZXdSaWdodClcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRjYXNlICdJbnNlcnQnOlxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XHRcdFx0XHRfMDogX2VsbV9sYW5nJGNvcmUkRGljdCRJbnNlcnQsXG5cdFx0XHRcdFx0XHRcdFx0XHRfMTogQTUoX2VsbV9sYW5nJGNvcmUkRGljdCRiYWxhbmNlLCBfcDUxLCBfcDUyLCBfcDU1LCBfcDUzLCBuZXdSaWdodClcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XHRcdFx0XHRfMDogX2VsbV9sYW5nJGNvcmUkRGljdCRSZW1vdmUsXG5cdFx0XHRcdFx0XHRcdFx0XHRfMTogQTUoX2VsbV9sYW5nJGNvcmUkRGljdCRidWJibGUsIF9wNTEsIF9wNTIsIF9wNTUsIF9wNTMsIG5ld1JpZ2h0KVxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdHZhciBfcDU2ID0gdXAoZGljdCk7XG5cdFx0dmFyIGZsYWcgPSBfcDU2Ll8wO1xuXHRcdHZhciB1cGRhdGVkRGljdCA9IF9wNTYuXzE7XG5cdFx0dmFyIF9wNTcgPSBmbGFnO1xuXHRcdHN3aXRjaCAoX3A1Ny5jdG9yKSB7XG5cdFx0XHRjYXNlICdTYW1lJzpcblx0XHRcdFx0cmV0dXJuIHVwZGF0ZWREaWN0O1xuXHRcdFx0Y2FzZSAnSW5zZXJ0Jzpcblx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJERpY3QkZW5zdXJlQmxhY2tSb290KHVwZGF0ZWREaWN0KTtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSREaWN0JGJsYWNrZW4odXBkYXRlZERpY3QpO1xuXHRcdH1cblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRpbnNlcnQgPSBGMyhcblx0ZnVuY3Rpb24gKGtleSwgdmFsdWUsIGRpY3QpIHtcblx0XHRyZXR1cm4gQTMoXG5cdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JHVwZGF0ZSxcblx0XHRcdGtleSxcblx0XHRcdF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRhbHdheXMoXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJE1heWJlJEp1c3QodmFsdWUpKSxcblx0XHRcdGRpY3QpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JHNpbmdsZXRvbiA9IEYyKFxuXHRmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXHRcdHJldHVybiBBMyhfZWxtX2xhbmckY29yZSREaWN0JGluc2VydCwga2V5LCB2YWx1ZSwgX2VsbV9sYW5nJGNvcmUkRGljdCRlbXB0eSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkdW5pb24gPSBGMihcblx0ZnVuY3Rpb24gKHQxLCB0Mikge1xuXHRcdHJldHVybiBBMyhfZWxtX2xhbmckY29yZSREaWN0JGZvbGRsLCBfZWxtX2xhbmckY29yZSREaWN0JGluc2VydCwgdDIsIHQxKTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRmaWx0ZXIgPSBGMihcblx0ZnVuY3Rpb24gKHByZWRpY2F0ZSwgZGljdGlvbmFyeSkge1xuXHRcdHZhciBhZGQgPSBGMyhcblx0XHRcdGZ1bmN0aW9uIChrZXksIHZhbHVlLCBkaWN0KSB7XG5cdFx0XHRcdHJldHVybiBBMihwcmVkaWNhdGUsIGtleSwgdmFsdWUpID8gQTMoX2VsbV9sYW5nJGNvcmUkRGljdCRpbnNlcnQsIGtleSwgdmFsdWUsIGRpY3QpIDogZGljdDtcblx0XHRcdH0pO1xuXHRcdHJldHVybiBBMyhfZWxtX2xhbmckY29yZSREaWN0JGZvbGRsLCBhZGQsIF9lbG1fbGFuZyRjb3JlJERpY3QkZW1wdHksIGRpY3Rpb25hcnkpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGludGVyc2VjdCA9IEYyKFxuXHRmdW5jdGlvbiAodDEsIHQyKSB7XG5cdFx0cmV0dXJuIEEyKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRmaWx0ZXIsXG5cdFx0XHRGMihcblx0XHRcdFx0ZnVuY3Rpb24gKGssIF9wNTgpIHtcblx0XHRcdFx0XHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkRGljdCRtZW1iZXIsIGssIHQyKTtcblx0XHRcdFx0fSksXG5cdFx0XHR0MSk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJERpY3QkcGFydGl0aW9uID0gRjIoXG5cdGZ1bmN0aW9uIChwcmVkaWNhdGUsIGRpY3QpIHtcblx0XHR2YXIgYWRkID0gRjMoXG5cdFx0XHRmdW5jdGlvbiAoa2V5LCB2YWx1ZSwgX3A1OSkge1xuXHRcdFx0XHR2YXIgX3A2MCA9IF9wNTk7XG5cdFx0XHRcdHZhciBfcDYyID0gX3A2MC5fMTtcblx0XHRcdFx0dmFyIF9wNjEgPSBfcDYwLl8wO1xuXHRcdFx0XHRyZXR1cm4gQTIocHJlZGljYXRlLCBrZXksIHZhbHVlKSA/IHtcblx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XzA6IEEzKF9lbG1fbGFuZyRjb3JlJERpY3QkaW5zZXJ0LCBrZXksIHZhbHVlLCBfcDYxKSxcblx0XHRcdFx0XHRfMTogX3A2MlxuXHRcdFx0XHR9IDoge1xuXHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRfMDogX3A2MSxcblx0XHRcdFx0XHRfMTogQTMoX2VsbV9sYW5nJGNvcmUkRGljdCRpbnNlcnQsIGtleSwgdmFsdWUsIF9wNjIpXG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHRyZXR1cm4gQTMoXG5cdFx0XHRfZWxtX2xhbmckY29yZSREaWN0JGZvbGRsLFxuXHRcdFx0YWRkLFxuXHRcdFx0e2N0b3I6ICdfVHVwbGUyJywgXzA6IF9lbG1fbGFuZyRjb3JlJERpY3QkZW1wdHksIF8xOiBfZWxtX2xhbmckY29yZSREaWN0JGVtcHR5fSxcblx0XHRcdGRpY3QpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGZyb21MaXN0ID0gZnVuY3Rpb24gKGFzc29jcykge1xuXHRyZXR1cm4gQTMoXG5cdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmb2xkbCxcblx0XHRGMihcblx0XHRcdGZ1bmN0aW9uIChfcDYzLCBkaWN0KSB7XG5cdFx0XHRcdHZhciBfcDY0ID0gX3A2Mztcblx0XHRcdFx0cmV0dXJuIEEzKF9lbG1fbGFuZyRjb3JlJERpY3QkaW5zZXJ0LCBfcDY0Ll8wLCBfcDY0Ll8xLCBkaWN0KTtcblx0XHRcdH0pLFxuXHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkZW1wdHksXG5cdFx0YXNzb2NzKTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkRGljdCRyZW1vdmUgPSBGMihcblx0ZnVuY3Rpb24gKGtleSwgZGljdCkge1xuXHRcdHJldHVybiBBMyhcblx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkdXBkYXRlLFxuXHRcdFx0a2V5LFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkQmFzaWNzJGFsd2F5cyhfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nKSxcblx0XHRcdGRpY3QpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckY29yZSREaWN0JGRpZmYgPSBGMihcblx0ZnVuY3Rpb24gKHQxLCB0Mikge1xuXHRcdHJldHVybiBBMyhcblx0XHRcdF9lbG1fbGFuZyRjb3JlJERpY3QkZm9sZGwsXG5cdFx0XHRGMyhcblx0XHRcdFx0ZnVuY3Rpb24gKGssIHYsIHQpIHtcblx0XHRcdFx0XHRyZXR1cm4gQTIoX2VsbV9sYW5nJGNvcmUkRGljdCRyZW1vdmUsIGssIHQpO1xuXHRcdFx0XHR9KSxcblx0XHRcdHQxLFxuXHRcdFx0dDIpO1xuXHR9KTtcblxudmFyIF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX1N1YiRiYXRjaCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9QbGF0Zm9ybS5iYXRjaDtcbnZhciBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9TdWIkbm9uZSA9IF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX1N1YiRiYXRjaChcblx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFtdKSk7XG52YXIgX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fU3ViJG1hcCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9QbGF0Zm9ybS5tYXA7XG52YXIgX2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fU3ViJFN1YiA9IHtjdG9yOiAnU3ViJ307XG5cbnZhciBfZWxtX2xhbmckY29yZSREZWJ1ZyRjcmFzaCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9EZWJ1Zy5jcmFzaDtcbnZhciBfZWxtX2xhbmckY29yZSREZWJ1ZyRsb2cgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfRGVidWcubG9nO1xuXG4vL2ltcG9ydCBNYXliZSwgTmF0aXZlLkFycmF5LCBOYXRpdmUuTGlzdCwgTmF0aXZlLlV0aWxzLCBSZXN1bHQgLy9cblxudmFyIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uID0gZnVuY3Rpb24oKSB7XG5cblxuLy8gQ09SRSBERUNPREVSU1xuXG5mdW5jdGlvbiBzdWNjZWVkKG1zZylcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnPGRlY29kZXI+Jyxcblx0XHR0YWc6ICdzdWNjZWVkJyxcblx0XHRtc2c6IG1zZ1xuXHR9O1xufVxuXG5mdW5jdGlvbiBmYWlsKG1zZylcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnPGRlY29kZXI+Jyxcblx0XHR0YWc6ICdmYWlsJyxcblx0XHRtc2c6IG1zZ1xuXHR9O1xufVxuXG5mdW5jdGlvbiBkZWNvZGVQcmltaXRpdmUodGFnKVxue1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICc8ZGVjb2Rlcj4nLFxuXHRcdHRhZzogdGFnXG5cdH07XG59XG5cbmZ1bmN0aW9uIGRlY29kZUNvbnRhaW5lcih0YWcsIGRlY29kZXIpXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJzxkZWNvZGVyPicsXG5cdFx0dGFnOiB0YWcsXG5cdFx0ZGVjb2RlcjogZGVjb2RlclxuXHR9O1xufVxuXG5mdW5jdGlvbiBkZWNvZGVOdWxsKHZhbHVlKVxue1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICc8ZGVjb2Rlcj4nLFxuXHRcdHRhZzogJ251bGwnLFxuXHRcdHZhbHVlOiB2YWx1ZVxuXHR9O1xufVxuXG5mdW5jdGlvbiBkZWNvZGVGaWVsZChmaWVsZCwgZGVjb2Rlcilcbntcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnPGRlY29kZXI+Jyxcblx0XHR0YWc6ICdmaWVsZCcsXG5cdFx0ZmllbGQ6IGZpZWxkLFxuXHRcdGRlY29kZXI6IGRlY29kZXJcblx0fTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlS2V5VmFsdWVQYWlycyhkZWNvZGVyKVxue1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICc8ZGVjb2Rlcj4nLFxuXHRcdHRhZzogJ2tleS12YWx1ZScsXG5cdFx0ZGVjb2RlcjogZGVjb2RlclxuXHR9O1xufVxuXG5mdW5jdGlvbiBkZWNvZGVPYmplY3QoZiwgZGVjb2RlcnMpXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJzxkZWNvZGVyPicsXG5cdFx0dGFnOiAnbWFwLW1hbnknLFxuXHRcdGZ1bmM6IGYsXG5cdFx0ZGVjb2RlcnM6IGRlY29kZXJzXG5cdH07XG59XG5cbmZ1bmN0aW9uIGRlY29kZVR1cGxlKGYsIGRlY29kZXJzKVxue1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICc8ZGVjb2Rlcj4nLFxuXHRcdHRhZzogJ3R1cGxlJyxcblx0XHRmdW5jOiBmLFxuXHRcdGRlY29kZXJzOiBkZWNvZGVyc1xuXHR9O1xufVxuXG5mdW5jdGlvbiBhbmRUaGVuKGRlY29kZXIsIGNhbGxiYWNrKVxue1xuXHRyZXR1cm4ge1xuXHRcdGN0b3I6ICc8ZGVjb2Rlcj4nLFxuXHRcdHRhZzogJ2FuZFRoZW4nLFxuXHRcdGRlY29kZXI6IGRlY29kZXIsXG5cdFx0Y2FsbGJhY2s6IGNhbGxiYWNrXG5cdH07XG59XG5cbmZ1bmN0aW9uIGN1c3RvbUFuZFRoZW4oZGVjb2RlciwgY2FsbGJhY2spXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJzxkZWNvZGVyPicsXG5cdFx0dGFnOiAnY3VzdG9tQW5kVGhlbicsXG5cdFx0ZGVjb2RlcjogZGVjb2Rlcixcblx0XHRjYWxsYmFjazogY2FsbGJhY2tcblx0fTtcbn1cblxuZnVuY3Rpb24gb25lT2YoZGVjb2RlcnMpXG57XG5cdHJldHVybiB7XG5cdFx0Y3RvcjogJzxkZWNvZGVyPicsXG5cdFx0dGFnOiAnb25lT2YnLFxuXHRcdGRlY29kZXJzOiBkZWNvZGVyc1xuXHR9O1xufVxuXG5cbi8vIERFQ09ESU5HIE9CSkVDVFNcblxuZnVuY3Rpb24gZGVjb2RlT2JqZWN0MShmLCBkMSlcbntcblx0cmV0dXJuIGRlY29kZU9iamVjdChmLCBbZDFdKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlT2JqZWN0MihmLCBkMSwgZDIpXG57XG5cdHJldHVybiBkZWNvZGVPYmplY3QoZiwgW2QxLCBkMl0pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVPYmplY3QzKGYsIGQxLCBkMiwgZDMpXG57XG5cdHJldHVybiBkZWNvZGVPYmplY3QoZiwgW2QxLCBkMiwgZDNdKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlT2JqZWN0NChmLCBkMSwgZDIsIGQzLCBkNClcbntcblx0cmV0dXJuIGRlY29kZU9iamVjdChmLCBbZDEsIGQyLCBkMywgZDRdKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlT2JqZWN0NShmLCBkMSwgZDIsIGQzLCBkNCwgZDUpXG57XG5cdHJldHVybiBkZWNvZGVPYmplY3QoZiwgW2QxLCBkMiwgZDMsIGQ0LCBkNV0pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVPYmplY3Q2KGYsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYpXG57XG5cdHJldHVybiBkZWNvZGVPYmplY3QoZiwgW2QxLCBkMiwgZDMsIGQ0LCBkNSwgZDZdKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlT2JqZWN0NyhmLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNylcbntcblx0cmV0dXJuIGRlY29kZU9iamVjdChmLCBbZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDddKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlT2JqZWN0OChmLCBkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDgpXG57XG5cdHJldHVybiBkZWNvZGVPYmplY3QoZiwgW2QxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOF0pO1xufVxuXG5cbi8vIERFQ09ESU5HIFRVUExFU1xuXG5mdW5jdGlvbiBkZWNvZGVUdXBsZTEoZiwgZDEpXG57XG5cdHJldHVybiBkZWNvZGVUdXBsZShmLCBbZDFdKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlVHVwbGUyKGYsIGQxLCBkMilcbntcblx0cmV0dXJuIGRlY29kZVR1cGxlKGYsIFtkMSwgZDJdKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlVHVwbGUzKGYsIGQxLCBkMiwgZDMpXG57XG5cdHJldHVybiBkZWNvZGVUdXBsZShmLCBbZDEsIGQyLCBkM10pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVUdXBsZTQoZiwgZDEsIGQyLCBkMywgZDQpXG57XG5cdHJldHVybiBkZWNvZGVUdXBsZShmLCBbZDEsIGQyLCBkMywgZDRdKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlVHVwbGU1KGYsIGQxLCBkMiwgZDMsIGQ0LCBkNSlcbntcblx0cmV0dXJuIGRlY29kZVR1cGxlKGYsIFtkMSwgZDIsIGQzLCBkNCwgZDVdKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlVHVwbGU2KGYsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYpXG57XG5cdHJldHVybiBkZWNvZGVUdXBsZShmLCBbZDEsIGQyLCBkMywgZDQsIGQ1LCBkNl0pO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVUdXBsZTcoZiwgZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDcpXG57XG5cdHJldHVybiBkZWNvZGVUdXBsZShmLCBbZDEsIGQyLCBkMywgZDQsIGQ1LCBkNiwgZDddKTtcbn1cblxuZnVuY3Rpb24gZGVjb2RlVHVwbGU4KGYsIGQxLCBkMiwgZDMsIGQ0LCBkNSwgZDYsIGQ3LCBkOClcbntcblx0cmV0dXJuIGRlY29kZVR1cGxlKGYsIFtkMSwgZDIsIGQzLCBkNCwgZDUsIGQ2LCBkNywgZDhdKTtcbn1cblxuXG4vLyBERUNPREUgSEVMUEVSU1xuXG5mdW5jdGlvbiBvayh2YWx1ZSlcbntcblx0cmV0dXJuIHsgdGFnOiAnb2snLCB2YWx1ZTogdmFsdWUgfTtcbn1cblxuZnVuY3Rpb24gYmFkUHJpbWl0aXZlKHR5cGUsIHZhbHVlKVxue1xuXHRyZXR1cm4geyB0YWc6ICdwcmltaXRpdmUnLCB0eXBlOiB0eXBlLCB2YWx1ZTogdmFsdWUgfTtcbn1cblxuZnVuY3Rpb24gYmFkSW5kZXgoaW5kZXgsIG5lc3RlZFByb2JsZW1zKVxue1xuXHRyZXR1cm4geyB0YWc6ICdpbmRleCcsIGluZGV4OiBpbmRleCwgcmVzdDogbmVzdGVkUHJvYmxlbXMgfTtcbn1cblxuZnVuY3Rpb24gYmFkRmllbGQoZmllbGQsIG5lc3RlZFByb2JsZW1zKVxue1xuXHRyZXR1cm4geyB0YWc6ICdmaWVsZCcsIGZpZWxkOiBmaWVsZCwgcmVzdDogbmVzdGVkUHJvYmxlbXMgfTtcbn1cblxuZnVuY3Rpb24gYmFkT25lT2YocHJvYmxlbXMpXG57XG5cdHJldHVybiB7IHRhZzogJ29uZU9mJywgcHJvYmxlbXM6IHByb2JsZW1zIH07XG59XG5cbmZ1bmN0aW9uIGJhZEN1c3RvbShtc2cpXG57XG5cdHJldHVybiB7IHRhZzogJ2N1c3RvbScsIG1zZzogbXNnIH07XG59XG5cbmZ1bmN0aW9uIGJhZChtc2cpXG57XG5cdHJldHVybiB7IHRhZzogJ2ZhaWwnLCBtc2c6IG1zZyB9O1xufVxuXG5mdW5jdGlvbiBiYWRUb1N0cmluZyhwcm9ibGVtKVxue1xuXHR2YXIgY29udGV4dCA9ICdfJztcblx0d2hpbGUgKHByb2JsZW0pXG5cdHtcblx0XHRzd2l0Y2ggKHByb2JsZW0udGFnKVxuXHRcdHtcblx0XHRcdGNhc2UgJ3ByaW1pdGl2ZSc6XG5cdFx0XHRcdHJldHVybiAnRXhwZWN0aW5nICcgKyBwcm9ibGVtLnR5cGVcblx0XHRcdFx0XHQrIChjb250ZXh0ID09PSAnXycgPyAnJyA6ICcgYXQgJyArIGNvbnRleHQpXG5cdFx0XHRcdFx0KyAnIGJ1dCBpbnN0ZWFkIGdvdDogJyArIGpzVG9TdHJpbmcocHJvYmxlbS52YWx1ZSk7XG5cblx0XHRcdGNhc2UgJ2luZGV4Jzpcblx0XHRcdFx0Y29udGV4dCArPSAnWycgKyBwcm9ibGVtLmluZGV4ICsgJ10nO1xuXHRcdFx0XHRwcm9ibGVtID0gcHJvYmxlbS5yZXN0O1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSAnZmllbGQnOlxuXHRcdFx0XHRjb250ZXh0ICs9ICcuJyArIHByb2JsZW0uZmllbGQ7XG5cdFx0XHRcdHByb2JsZW0gPSBwcm9ibGVtLnJlc3Q7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICdvbmVPZic6XG5cdFx0XHRcdHZhciBwcm9ibGVtcyA9IHByb2JsZW0ucHJvYmxlbXM7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcHJvYmxlbXMubGVuZ3RoOyBpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwcm9ibGVtc1tpXSA9IGJhZFRvU3RyaW5nKHByb2JsZW1zW2ldKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gJ0kgcmFuIGludG8gdGhlIGZvbGxvd2luZyBwcm9ibGVtcydcblx0XHRcdFx0XHQrIChjb250ZXh0ID09PSAnXycgPyAnJyA6ICcgYXQgJyArIGNvbnRleHQpXG5cdFx0XHRcdFx0KyAnOlxcblxcbicgKyBwcm9ibGVtcy5qb2luKCdcXG4nKTtcblxuXHRcdFx0Y2FzZSAnY3VzdG9tJzpcblx0XHRcdFx0cmV0dXJuICdBIGBjdXN0b21EZWNvZGVyYCBmYWlsZWQnXG5cdFx0XHRcdFx0KyAoY29udGV4dCA9PT0gJ18nID8gJycgOiAnIGF0ICcgKyBjb250ZXh0KVxuXHRcdFx0XHRcdCsgJyB3aXRoIHRoZSBtZXNzYWdlOiAnICsgcHJvYmxlbS5tc2c7XG5cblx0XHRcdGNhc2UgJ2ZhaWwnOlxuXHRcdFx0XHRyZXR1cm4gJ0kgcmFuIGludG8gYSBgZmFpbGAgZGVjb2Rlcidcblx0XHRcdFx0XHQrIChjb250ZXh0ID09PSAnXycgPyAnJyA6ICcgYXQgJyArIGNvbnRleHQpXG5cdFx0XHRcdFx0KyAnOiAnICsgcHJvYmxlbS5tc2c7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGpzVG9TdHJpbmcodmFsdWUpXG57XG5cdHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkXG5cdFx0PyAndW5kZWZpbmVkJ1xuXHRcdDogSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xufVxuXG5cbi8vIERFQ09ERVxuXG5mdW5jdGlvbiBydW5PblN0cmluZyhkZWNvZGVyLCBzdHJpbmcpXG57XG5cdHZhciBqc29uO1xuXHR0cnlcblx0e1xuXHRcdGpzb24gPSBKU09OLnBhcnNlKHN0cmluZyk7XG5cdH1cblx0Y2F0Y2ggKGUpXG5cdHtcblx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JEVycignR2l2ZW4gYW4gaW52YWxpZCBKU09OOiAnICsgZS5tZXNzYWdlKTtcblx0fVxuXHRyZXR1cm4gcnVuKGRlY29kZXIsIGpzb24pO1xufVxuXG5mdW5jdGlvbiBydW4oZGVjb2RlciwgdmFsdWUpXG57XG5cdHZhciByZXN1bHQgPSBydW5IZWxwKGRlY29kZXIsIHZhbHVlKTtcblx0cmV0dXJuIChyZXN1bHQudGFnID09PSAnb2snKVxuXHRcdD8gX2VsbV9sYW5nJGNvcmUkUmVzdWx0JE9rKHJlc3VsdC52YWx1ZSlcblx0XHQ6IF9lbG1fbGFuZyRjb3JlJFJlc3VsdCRFcnIoYmFkVG9TdHJpbmcocmVzdWx0KSk7XG59XG5cbmZ1bmN0aW9uIHJ1bkhlbHAoZGVjb2RlciwgdmFsdWUpXG57XG5cdHN3aXRjaCAoZGVjb2Rlci50YWcpXG5cdHtcblx0XHRjYXNlICdib29sJzpcblx0XHRcdHJldHVybiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpXG5cdFx0XHRcdD8gb2sodmFsdWUpXG5cdFx0XHRcdDogYmFkUHJpbWl0aXZlKCdhIEJvb2wnLCB2YWx1ZSk7XG5cblx0XHRjYXNlICdpbnQnOlxuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicpIHtcblx0XHRcdFx0cmV0dXJuIGJhZFByaW1pdGl2ZSgnYW4gSW50JywgdmFsdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoLTIxNDc0ODM2NDcgPCB2YWx1ZSAmJiB2YWx1ZSA8IDIxNDc0ODM2NDcgJiYgKHZhbHVlIHwgMCkgPT09IHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiBvayh2YWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpc0Zpbml0ZSh2YWx1ZSkgJiYgISh2YWx1ZSAlIDEpKSB7XG5cdFx0XHRcdHJldHVybiBvayh2YWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBiYWRQcmltaXRpdmUoJ2FuIEludCcsIHZhbHVlKTtcblxuXHRcdGNhc2UgJ2Zsb2F0Jzpcblx0XHRcdHJldHVybiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJylcblx0XHRcdFx0PyBvayh2YWx1ZSlcblx0XHRcdFx0OiBiYWRQcmltaXRpdmUoJ2EgRmxvYXQnLCB2YWx1ZSk7XG5cblx0XHRjYXNlICdzdHJpbmcnOlxuXHRcdFx0cmV0dXJuICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKVxuXHRcdFx0XHQ/IG9rKHZhbHVlKVxuXHRcdFx0XHQ6ICh2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZylcblx0XHRcdFx0XHQ/IG9rKHZhbHVlICsgJycpXG5cdFx0XHRcdFx0OiBiYWRQcmltaXRpdmUoJ2EgU3RyaW5nJywgdmFsdWUpO1xuXG5cdFx0Y2FzZSAnbnVsbCc6XG5cdFx0XHRyZXR1cm4gKHZhbHVlID09PSBudWxsKVxuXHRcdFx0XHQ/IG9rKGRlY29kZXIudmFsdWUpXG5cdFx0XHRcdDogYmFkUHJpbWl0aXZlKCdudWxsJywgdmFsdWUpO1xuXG5cdFx0Y2FzZSAndmFsdWUnOlxuXHRcdFx0cmV0dXJuIG9rKHZhbHVlKTtcblxuXHRcdGNhc2UgJ2xpc3QnOlxuXHRcdFx0aWYgKCEodmFsdWUgaW5zdGFuY2VvZiBBcnJheSkpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBiYWRQcmltaXRpdmUoJ2EgTGlzdCcsIHZhbHVlKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGxpc3QgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5OaWw7XG5cdFx0XHRmb3IgKHZhciBpID0gdmFsdWUubGVuZ3RoOyBpLS07IClcblx0XHRcdHtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IHJ1bkhlbHAoZGVjb2Rlci5kZWNvZGVyLCB2YWx1ZVtpXSk7XG5cdFx0XHRcdGlmIChyZXN1bHQudGFnICE9PSAnb2snKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGJhZEluZGV4KGksIHJlc3VsdClcblx0XHRcdFx0fVxuXHRcdFx0XHRsaXN0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuQ29ucyhyZXN1bHQudmFsdWUsIGxpc3QpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG9rKGxpc3QpO1xuXG5cdFx0Y2FzZSAnYXJyYXknOlxuXHRcdFx0aWYgKCEodmFsdWUgaW5zdGFuY2VvZiBBcnJheSkpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBiYWRQcmltaXRpdmUoJ2FuIEFycmF5JywgdmFsdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgbGVuID0gdmFsdWUubGVuZ3RoO1xuXHRcdFx0dmFyIGFycmF5ID0gbmV3IEFycmF5KGxlbik7XG5cdFx0XHRmb3IgKHZhciBpID0gbGVuOyBpLS07IClcblx0XHRcdHtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IHJ1bkhlbHAoZGVjb2Rlci5kZWNvZGVyLCB2YWx1ZVtpXSk7XG5cdFx0XHRcdGlmIChyZXN1bHQudGFnICE9PSAnb2snKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGJhZEluZGV4KGksIHJlc3VsdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YXJyYXlbaV0gPSByZXN1bHQudmFsdWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb2soX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0FycmF5LmZyb21KU0FycmF5KGFycmF5KSk7XG5cblx0XHRjYXNlICdtYXliZSc6XG5cdFx0XHR2YXIgcmVzdWx0ID0gcnVuSGVscChkZWNvZGVyLmRlY29kZXIsIHZhbHVlKTtcblx0XHRcdHJldHVybiAocmVzdWx0LnRhZyA9PT0gJ29rJylcblx0XHRcdFx0PyBvayhfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0KHJlc3VsdC52YWx1ZSkpXG5cdFx0XHRcdDogb2soX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZyk7XG5cblx0XHRjYXNlICdmaWVsZCc6XG5cdFx0XHR2YXIgZmllbGQgPSBkZWNvZGVyLmZpZWxkO1xuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgfHwgdmFsdWUgPT09IG51bGwgfHwgIShmaWVsZCBpbiB2YWx1ZSkpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBiYWRQcmltaXRpdmUoJ2FuIG9iamVjdCB3aXRoIGEgZmllbGQgbmFtZWQgYCcgKyBmaWVsZCArICdgJywgdmFsdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcmVzdWx0ID0gcnVuSGVscChkZWNvZGVyLmRlY29kZXIsIHZhbHVlW2ZpZWxkXSk7XG5cdFx0XHRyZXR1cm4gKHJlc3VsdC50YWcgPT09ICdvaycpXG5cdFx0XHRcdD8gcmVzdWx0XG5cdFx0XHRcdDogYmFkRmllbGQoZmllbGQsIHJlc3VsdCk7XG5cblx0XHRjYXNlICdrZXktdmFsdWUnOlxuXHRcdFx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcgfHwgdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgaW5zdGFuY2VvZiBBcnJheSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGJhZFByaW1pdGl2ZSgnYW4gb2JqZWN0JywgdmFsdWUpO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIga2V5VmFsdWVQYWlycyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0Lk5pbDtcblx0XHRcdGZvciAodmFyIGtleSBpbiB2YWx1ZSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIHJlc3VsdCA9IHJ1bkhlbHAoZGVjb2Rlci5kZWNvZGVyLCB2YWx1ZVtrZXldKTtcblx0XHRcdFx0aWYgKHJlc3VsdC50YWcgIT09ICdvaycpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gYmFkRmllbGQoa2V5LCByZXN1bHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBwYWlyID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLlR1cGxlMihrZXksIHJlc3VsdC52YWx1ZSk7XG5cdFx0XHRcdGtleVZhbHVlUGFpcnMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5Db25zKHBhaXIsIGtleVZhbHVlUGFpcnMpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG9rKGtleVZhbHVlUGFpcnMpO1xuXG5cdFx0Y2FzZSAnbWFwLW1hbnknOlxuXHRcdFx0dmFyIGFuc3dlciA9IGRlY29kZXIuZnVuYztcblx0XHRcdHZhciBkZWNvZGVycyA9IGRlY29kZXIuZGVjb2RlcnM7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGRlY29kZXJzLmxlbmd0aDsgaSsrKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgcmVzdWx0ID0gcnVuSGVscChkZWNvZGVyc1tpXSwgdmFsdWUpO1xuXHRcdFx0XHRpZiAocmVzdWx0LnRhZyAhPT0gJ29rJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0YW5zd2VyID0gYW5zd2VyKHJlc3VsdC52YWx1ZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb2soYW5zd2VyKTtcblxuXHRcdGNhc2UgJ3R1cGxlJzpcblx0XHRcdHZhciBkZWNvZGVycyA9IGRlY29kZXIuZGVjb2RlcnM7XG5cdFx0XHR2YXIgbGVuID0gZGVjb2RlcnMubGVuZ3RoO1xuXG5cdFx0XHRpZiAoICEodmFsdWUgaW5zdGFuY2VvZiBBcnJheSkgfHwgdmFsdWUubGVuZ3RoICE9PSBsZW4gKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gYmFkUHJpbWl0aXZlKCdhIFR1cGxlIHdpdGggJyArIGxlbiArICcgZW50cmllcycsIHZhbHVlKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGFuc3dlciA9IGRlY29kZXIuZnVuYztcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdHZhciByZXN1bHQgPSBydW5IZWxwKGRlY29kZXJzW2ldLCB2YWx1ZVtpXSk7XG5cdFx0XHRcdGlmIChyZXN1bHQudGFnICE9PSAnb2snKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGJhZEluZGV4KGksIHJlc3VsdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YW5zd2VyID0gYW5zd2VyKHJlc3VsdC52YWx1ZSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb2soYW5zd2VyKTtcblxuXHRcdGNhc2UgJ2N1c3RvbUFuZFRoZW4nOlxuXHRcdFx0dmFyIHJlc3VsdCA9IHJ1bkhlbHAoZGVjb2Rlci5kZWNvZGVyLCB2YWx1ZSk7XG5cdFx0XHRpZiAocmVzdWx0LnRhZyAhPT0gJ29rJylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH1cblx0XHRcdHZhciByZWFsUmVzdWx0ID0gZGVjb2Rlci5jYWxsYmFjayhyZXN1bHQudmFsdWUpO1xuXHRcdFx0aWYgKHJlYWxSZXN1bHQuY3RvciA9PT0gJ0VycicpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBiYWRDdXN0b20ocmVhbFJlc3VsdC5fMCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb2socmVhbFJlc3VsdC5fMCk7XG5cblx0XHRjYXNlICdhbmRUaGVuJzpcblx0XHRcdHZhciByZXN1bHQgPSBydW5IZWxwKGRlY29kZXIuZGVjb2RlciwgdmFsdWUpO1xuXHRcdFx0cmV0dXJuIChyZXN1bHQudGFnICE9PSAnb2snKVxuXHRcdFx0XHQ/IHJlc3VsdFxuXHRcdFx0XHQ6IHJ1bkhlbHAoZGVjb2Rlci5jYWxsYmFjayhyZXN1bHQudmFsdWUpLCB2YWx1ZSk7XG5cblx0XHRjYXNlICdvbmVPZic6XG5cdFx0XHR2YXIgZXJyb3JzID0gW107XG5cdFx0XHR2YXIgdGVtcCA9IGRlY29kZXIuZGVjb2RlcnM7XG5cdFx0XHR3aGlsZSAodGVtcC5jdG9yICE9PSAnW10nKVxuXHRcdFx0e1xuXHRcdFx0XHR2YXIgcmVzdWx0ID0gcnVuSGVscCh0ZW1wLl8wLCB2YWx1ZSk7XG5cblx0XHRcdFx0aWYgKHJlc3VsdC50YWcgPT09ICdvaycpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZXJyb3JzLnB1c2gocmVzdWx0KTtcblxuXHRcdFx0XHR0ZW1wID0gdGVtcC5fMTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBiYWRPbmVPZihlcnJvcnMpO1xuXG5cdFx0Y2FzZSAnZmFpbCc6XG5cdFx0XHRyZXR1cm4gYmFkKGRlY29kZXIubXNnKTtcblxuXHRcdGNhc2UgJ3N1Y2NlZWQnOlxuXHRcdFx0cmV0dXJuIG9rKGRlY29kZXIubXNnKTtcblx0fVxufVxuXG5cbi8vIEVRVUFMSVRZXG5cbmZ1bmN0aW9uIGVxdWFsaXR5KGEsIGIpXG57XG5cdGlmIChhID09PSBiKVxuXHR7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRpZiAoYS50YWcgIT09IGIudGFnKVxuXHR7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0c3dpdGNoIChhLnRhZylcblx0e1xuXHRcdGNhc2UgJ3N1Y2NlZWQnOlxuXHRcdGNhc2UgJ2ZhaWwnOlxuXHRcdFx0cmV0dXJuIGEubXNnID09PSBiLm1zZztcblxuXHRcdGNhc2UgJ2Jvb2wnOlxuXHRcdGNhc2UgJ2ludCc6XG5cdFx0Y2FzZSAnZmxvYXQnOlxuXHRcdGNhc2UgJ3N0cmluZyc6XG5cdFx0Y2FzZSAndmFsdWUnOlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHRjYXNlICdudWxsJzpcblx0XHRcdHJldHVybiBhLnZhbHVlID09PSBiLnZhbHVlO1xuXG5cdFx0Y2FzZSAnbGlzdCc6XG5cdFx0Y2FzZSAnYXJyYXknOlxuXHRcdGNhc2UgJ21heWJlJzpcblx0XHRjYXNlICdrZXktdmFsdWUnOlxuXHRcdFx0cmV0dXJuIGVxdWFsaXR5KGEuZGVjb2RlciwgYi5kZWNvZGVyKTtcblxuXHRcdGNhc2UgJ2ZpZWxkJzpcblx0XHRcdHJldHVybiBhLmZpZWxkID09PSBiLmZpZWxkICYmIGVxdWFsaXR5KGEuZGVjb2RlciwgYi5kZWNvZGVyKTtcblxuXHRcdGNhc2UgJ21hcC1tYW55Jzpcblx0XHRjYXNlICd0dXBsZSc6XG5cdFx0XHRpZiAoYS5mdW5jICE9PSBiLmZ1bmMpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBsaXN0RXF1YWxpdHkoYS5kZWNvZGVycywgYi5kZWNvZGVycyk7XG5cblx0XHRjYXNlICdhbmRUaGVuJzpcblx0XHRjYXNlICdjdXN0b21BbmRUaGVuJzpcblx0XHRcdHJldHVybiBhLmNhbGxiYWNrID09PSBiLmNhbGxiYWNrICYmIGVxdWFsaXR5KGEuZGVjb2RlciwgYi5kZWNvZGVyKTtcblxuXHRcdGNhc2UgJ29uZU9mJzpcblx0XHRcdHJldHVybiBsaXN0RXF1YWxpdHkoYS5kZWNvZGVycywgYi5kZWNvZGVycyk7XG5cdH1cbn1cblxuZnVuY3Rpb24gbGlzdEVxdWFsaXR5KGFEZWNvZGVycywgYkRlY29kZXJzKVxue1xuXHR2YXIgbGVuID0gYURlY29kZXJzLmxlbmd0aDtcblx0aWYgKGxlbiAhPT0gYkRlY29kZXJzLmxlbmd0aClcblx0e1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuXHR7XG5cdFx0aWYgKCFlcXVhbGl0eShhRGVjb2RlcnNbaV0sIGJEZWNvZGVyc1tpXSkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuXG4vLyBFTkNPREVcblxuZnVuY3Rpb24gZW5jb2RlKGluZGVudExldmVsLCB2YWx1ZSlcbntcblx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHVlLCBudWxsLCBpbmRlbnRMZXZlbCk7XG59XG5cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKVxue1xuXHRyZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGVuY29kZU9iamVjdChrZXlWYWx1ZVBhaXJzKVxue1xuXHR2YXIgb2JqID0ge307XG5cdHdoaWxlIChrZXlWYWx1ZVBhaXJzLmN0b3IgIT09ICdbXScpXG5cdHtcblx0XHR2YXIgcGFpciA9IGtleVZhbHVlUGFpcnMuXzA7XG5cdFx0b2JqW3BhaXIuXzBdID0gcGFpci5fMTtcblx0XHRrZXlWYWx1ZVBhaXJzID0ga2V5VmFsdWVQYWlycy5fMTtcblx0fVxuXHRyZXR1cm4gb2JqO1xufVxuXG5yZXR1cm4ge1xuXHRlbmNvZGU6IEYyKGVuY29kZSksXG5cdHJ1bk9uU3RyaW5nOiBGMihydW5PblN0cmluZyksXG5cdHJ1bjogRjIocnVuKSxcblxuXHRkZWNvZGVOdWxsOiBkZWNvZGVOdWxsLFxuXHRkZWNvZGVQcmltaXRpdmU6IGRlY29kZVByaW1pdGl2ZSxcblx0ZGVjb2RlQ29udGFpbmVyOiBGMihkZWNvZGVDb250YWluZXIpLFxuXG5cdGRlY29kZUZpZWxkOiBGMihkZWNvZGVGaWVsZCksXG5cblx0ZGVjb2RlT2JqZWN0MTogRjIoZGVjb2RlT2JqZWN0MSksXG5cdGRlY29kZU9iamVjdDI6IEYzKGRlY29kZU9iamVjdDIpLFxuXHRkZWNvZGVPYmplY3QzOiBGNChkZWNvZGVPYmplY3QzKSxcblx0ZGVjb2RlT2JqZWN0NDogRjUoZGVjb2RlT2JqZWN0NCksXG5cdGRlY29kZU9iamVjdDU6IEY2KGRlY29kZU9iamVjdDUpLFxuXHRkZWNvZGVPYmplY3Q2OiBGNyhkZWNvZGVPYmplY3Q2KSxcblx0ZGVjb2RlT2JqZWN0NzogRjgoZGVjb2RlT2JqZWN0NyksXG5cdGRlY29kZU9iamVjdDg6IEY5KGRlY29kZU9iamVjdDgpLFxuXHRkZWNvZGVLZXlWYWx1ZVBhaXJzOiBkZWNvZGVLZXlWYWx1ZVBhaXJzLFxuXG5cdGRlY29kZVR1cGxlMTogRjIoZGVjb2RlVHVwbGUxKSxcblx0ZGVjb2RlVHVwbGUyOiBGMyhkZWNvZGVUdXBsZTIpLFxuXHRkZWNvZGVUdXBsZTM6IEY0KGRlY29kZVR1cGxlMyksXG5cdGRlY29kZVR1cGxlNDogRjUoZGVjb2RlVHVwbGU0KSxcblx0ZGVjb2RlVHVwbGU1OiBGNihkZWNvZGVUdXBsZTUpLFxuXHRkZWNvZGVUdXBsZTY6IEY3KGRlY29kZVR1cGxlNiksXG5cdGRlY29kZVR1cGxlNzogRjgoZGVjb2RlVHVwbGU3KSxcblx0ZGVjb2RlVHVwbGU4OiBGOShkZWNvZGVUdXBsZTgpLFxuXG5cdGFuZFRoZW46IEYyKGFuZFRoZW4pLFxuXHRjdXN0b21BbmRUaGVuOiBGMihjdXN0b21BbmRUaGVuKSxcblx0ZmFpbDogZmFpbCxcblx0c3VjY2VlZDogc3VjY2VlZCxcblx0b25lT2Y6IG9uZU9mLFxuXG5cdGlkZW50aXR5OiBpZGVudGl0eSxcblx0ZW5jb2RlTnVsbDogbnVsbCxcblx0ZW5jb2RlQXJyYXk6IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9BcnJheS50b0pTQXJyYXksXG5cdGVuY29kZUxpc3Q6IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LnRvQXJyYXksXG5cdGVuY29kZU9iamVjdDogZW5jb2RlT2JqZWN0LFxuXG5cdGVxdWFsaXR5OiBlcXVhbGl0eVxufTtcblxufSgpO1xuXG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9FbmNvZGUkbGlzdCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmVuY29kZUxpc3Q7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9FbmNvZGUkYXJyYXkgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5lbmNvZGVBcnJheTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0VuY29kZSRvYmplY3QgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5lbmNvZGVPYmplY3Q7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9FbmNvZGUkbnVsbCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmVuY29kZU51bGw7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9FbmNvZGUkYm9vbCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmlkZW50aXR5O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRW5jb2RlJGZsb2F0ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uaWRlbnRpdHk7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9FbmNvZGUkaW50ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uaWRlbnRpdHk7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9FbmNvZGUkc3RyaW5nID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uaWRlbnRpdHk7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9FbmNvZGUkZW5jb2RlID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZW5jb2RlO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRW5jb2RlJFZhbHVlID0ge2N0b3I6ICdWYWx1ZSd9O1xuXG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkdHVwbGU4ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlVHVwbGU4O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHR1cGxlNyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZVR1cGxlNztcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSR0dXBsZTYgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVUdXBsZTY7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkdHVwbGU1ID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlVHVwbGU1O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHR1cGxlNCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZVR1cGxlNDtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSR0dXBsZTMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVUdXBsZTM7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkdHVwbGUyID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlVHVwbGUyO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHR1cGxlMSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZVR1cGxlMTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRzdWNjZWVkID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uc3VjY2VlZDtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRmYWlsID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZmFpbDtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRhbmRUaGVuID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uYW5kVGhlbjtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRjdXN0b21EZWNvZGVyID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uY3VzdG9tQW5kVGhlbjtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRkZWNvZGVWYWx1ZSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLnJ1bjtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSR2YWx1ZSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZVByaW1pdGl2ZSgndmFsdWUnKTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRtYXliZSA9IGZ1bmN0aW9uIChkZWNvZGVyKSB7XG5cdHJldHVybiBBMihfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVDb250YWluZXIsICdtYXliZScsIGRlY29kZXIpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRudWxsID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlTnVsbDtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRhcnJheSA9IGZ1bmN0aW9uIChkZWNvZGVyKSB7XG5cdHJldHVybiBBMihfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVDb250YWluZXIsICdhcnJheScsIGRlY29kZXIpO1xufTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRsaXN0ID0gZnVuY3Rpb24gKGRlY29kZXIpIHtcblx0cmV0dXJuIEEyKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZUNvbnRhaW5lciwgJ2xpc3QnLCBkZWNvZGVyKTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkYm9vbCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZVByaW1pdGl2ZSgnYm9vbCcpO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGludCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZVByaW1pdGl2ZSgnaW50Jyk7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkZmxvYXQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVQcmltaXRpdmUoJ2Zsb2F0Jyk7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkc3RyaW5nID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX0pzb24uZGVjb2RlUHJpbWl0aXZlKCdzdHJpbmcnKTtcbnZhciBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRvbmVPZiA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLm9uZU9mO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGtleVZhbHVlUGFpcnMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVLZXlWYWx1ZVBhaXJzO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG9iamVjdDggPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVPYmplY3Q4O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG9iamVjdDcgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVPYmplY3Q3O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG9iamVjdDYgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVPYmplY3Q2O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG9iamVjdDUgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVPYmplY3Q1O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG9iamVjdDQgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVPYmplY3Q0O1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG9iamVjdDMgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVPYmplY3QzO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG9iamVjdDIgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVPYmplY3QyO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG9iamVjdDEgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfSnNvbi5kZWNvZGVPYmplY3QxO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlX29wcyA9IF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlX29wcyB8fCB7fTtcbl9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlX29wc1snOj0nXSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZUZpZWxkO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGF0ID0gRjIoXG5cdGZ1bmN0aW9uIChmaWVsZHMsIGRlY29kZXIpIHtcblx0XHRyZXR1cm4gQTMoXG5cdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGZvbGRyLFxuXHRcdFx0RjIoXG5cdFx0XHRcdGZ1bmN0aW9uICh4LCB5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIEEyKF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlX29wc1snOj0nXSwgeCwgeSk7XG5cdFx0XHRcdH0pLFxuXHRcdFx0ZGVjb2Rlcixcblx0XHRcdGZpZWxkcyk7XG5cdH0pO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGRlY29kZVN0cmluZyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLnJ1bk9uU3RyaW5nO1xudmFyIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG1hcCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmRlY29kZU9iamVjdDE7XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkZGljdCA9IGZ1bmN0aW9uIChkZWNvZGVyKSB7XG5cdHJldHVybiBBMihcblx0XHRfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRtYXAsXG5cdFx0X2VsbV9sYW5nJGNvcmUkRGljdCRmcm9tTGlzdCxcblx0XHRfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRrZXlWYWx1ZVBhaXJzKGRlY29kZXIpKTtcbn07XG52YXIgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkRGVjb2RlciA9IHtjdG9yOiAnRGVjb2Rlcid9O1xuXG4vL2ltcG9ydCBOYXRpdmUuSnNvbiAvL1xuXG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJE5hdGl2ZV9WaXJ0dWFsRG9tID0gZnVuY3Rpb24oKSB7XG5cbnZhciBTVFlMRV9LRVkgPSAnU1RZTEUnO1xudmFyIEVWRU5UX0tFWSA9ICdFVkVOVCc7XG52YXIgQVRUUl9LRVkgPSAnQVRUUic7XG52YXIgQVRUUl9OU19LRVkgPSAnQVRUUl9OUyc7XG5cblxuXG4vLy8vLy8vLy8vLy8gIFZJUlRVQUwgRE9NIE5PREVTICAvLy8vLy8vLy8vLy9cblxuXG5mdW5jdGlvbiB0ZXh0KHN0cmluZylcbntcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAndGV4dCcsXG5cdFx0dGV4dDogc3RyaW5nXG5cdH07XG59XG5cblxuZnVuY3Rpb24gbm9kZSh0YWcpXG57XG5cdHJldHVybiBGMihmdW5jdGlvbihmYWN0TGlzdCwga2lkTGlzdCkge1xuXHRcdHJldHVybiBub2RlSGVscCh0YWcsIGZhY3RMaXN0LCBraWRMaXN0KTtcblx0fSk7XG59XG5cblxuZnVuY3Rpb24gbm9kZUhlbHAodGFnLCBmYWN0TGlzdCwga2lkTGlzdClcbntcblx0dmFyIG9yZ2FuaXplZCA9IG9yZ2FuaXplRmFjdHMoZmFjdExpc3QpO1xuXHR2YXIgbmFtZXNwYWNlID0gb3JnYW5pemVkLm5hbWVzcGFjZTtcblx0dmFyIGZhY3RzID0gb3JnYW5pemVkLmZhY3RzO1xuXG5cdHZhciBjaGlsZHJlbiA9IFtdO1xuXHR2YXIgZGVzY2VuZGFudHNDb3VudCA9IDA7XG5cdHdoaWxlIChraWRMaXN0LmN0b3IgIT09ICdbXScpXG5cdHtcblx0XHR2YXIga2lkID0ga2lkTGlzdC5fMDtcblx0XHRkZXNjZW5kYW50c0NvdW50ICs9IChraWQuZGVzY2VuZGFudHNDb3VudCB8fCAwKTtcblx0XHRjaGlsZHJlbi5wdXNoKGtpZCk7XG5cdFx0a2lkTGlzdCA9IGtpZExpc3QuXzE7XG5cdH1cblx0ZGVzY2VuZGFudHNDb3VudCArPSBjaGlsZHJlbi5sZW5ndGg7XG5cblx0cmV0dXJuIHtcblx0XHR0eXBlOiAnbm9kZScsXG5cdFx0dGFnOiB0YWcsXG5cdFx0ZmFjdHM6IGZhY3RzLFxuXHRcdGNoaWxkcmVuOiBjaGlsZHJlbixcblx0XHRuYW1lc3BhY2U6IG5hbWVzcGFjZSxcblx0XHRkZXNjZW5kYW50c0NvdW50OiBkZXNjZW5kYW50c0NvdW50XG5cdH07XG59XG5cblxuZnVuY3Rpb24ga2V5ZWROb2RlKHRhZywgZmFjdExpc3QsIGtpZExpc3QpXG57XG5cdHZhciBvcmdhbml6ZWQgPSBvcmdhbml6ZUZhY3RzKGZhY3RMaXN0KTtcblx0dmFyIG5hbWVzcGFjZSA9IG9yZ2FuaXplZC5uYW1lc3BhY2U7XG5cdHZhciBmYWN0cyA9IG9yZ2FuaXplZC5mYWN0cztcblxuXHR2YXIgY2hpbGRyZW4gPSBbXTtcblx0dmFyIGRlc2NlbmRhbnRzQ291bnQgPSAwO1xuXHR3aGlsZSAoa2lkTGlzdC5jdG9yICE9PSAnW10nKVxuXHR7XG5cdFx0dmFyIGtpZCA9IGtpZExpc3QuXzA7XG5cdFx0ZGVzY2VuZGFudHNDb3VudCArPSAoa2lkLl8xLmRlc2NlbmRhbnRzQ291bnQgfHwgMCk7XG5cdFx0Y2hpbGRyZW4ucHVzaChraWQpO1xuXHRcdGtpZExpc3QgPSBraWRMaXN0Ll8xO1xuXHR9XG5cdGRlc2NlbmRhbnRzQ291bnQgKz0gY2hpbGRyZW4ubGVuZ3RoO1xuXG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ2tleWVkLW5vZGUnLFxuXHRcdHRhZzogdGFnLFxuXHRcdGZhY3RzOiBmYWN0cyxcblx0XHRjaGlsZHJlbjogY2hpbGRyZW4sXG5cdFx0bmFtZXNwYWNlOiBuYW1lc3BhY2UsXG5cdFx0ZGVzY2VuZGFudHNDb3VudDogZGVzY2VuZGFudHNDb3VudFxuXHR9O1xufVxuXG5cbmZ1bmN0aW9uIGN1c3RvbShmYWN0TGlzdCwgbW9kZWwsIGltcGwpXG57XG5cdHZhciBmYWN0cyA9IG9yZ2FuaXplRmFjdHMoZmFjdExpc3QpLmZhY3RzO1xuXG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ2N1c3RvbScsXG5cdFx0ZmFjdHM6IGZhY3RzLFxuXHRcdG1vZGVsOiBtb2RlbCxcblx0XHRpbXBsOiBpbXBsXG5cdH07XG59XG5cblxuZnVuY3Rpb24gbWFwKHRhZ2dlciwgbm9kZSlcbntcblx0cmV0dXJuIHtcblx0XHR0eXBlOiAndGFnZ2VyJyxcblx0XHR0YWdnZXI6IHRhZ2dlcixcblx0XHRub2RlOiBub2RlLFxuXHRcdGRlc2NlbmRhbnRzQ291bnQ6IDEgKyAobm9kZS5kZXNjZW5kYW50c0NvdW50IHx8IDApXG5cdH07XG59XG5cblxuZnVuY3Rpb24gdGh1bmsoZnVuYywgYXJncywgdGh1bmspXG57XG5cdHJldHVybiB7XG5cdFx0dHlwZTogJ3RodW5rJyxcblx0XHRmdW5jOiBmdW5jLFxuXHRcdGFyZ3M6IGFyZ3MsXG5cdFx0dGh1bms6IHRodW5rLFxuXHRcdG5vZGU6IHVuZGVmaW5lZFxuXHR9O1xufVxuXG5mdW5jdGlvbiBsYXp5KGZuLCBhKVxue1xuXHRyZXR1cm4gdGh1bmsoZm4sIFthXSwgZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGZuKGEpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gbGF6eTIoZm4sIGEsIGIpXG57XG5cdHJldHVybiB0aHVuayhmbiwgW2EsYl0sIGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBBMihmbiwgYSwgYik7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBsYXp5MyhmbiwgYSwgYiwgYylcbntcblx0cmV0dXJuIHRodW5rKGZuLCBbYSxiLGNdLCBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gQTMoZm4sIGEsIGIsIGMpO1xuXHR9KTtcbn1cblxuXG5cbi8vIEZBQ1RTXG5cblxuZnVuY3Rpb24gb3JnYW5pemVGYWN0cyhmYWN0TGlzdClcbntcblx0dmFyIG5hbWVzcGFjZSwgZmFjdHMgPSB7fTtcblxuXHR3aGlsZSAoZmFjdExpc3QuY3RvciAhPT0gJ1tdJylcblx0e1xuXHRcdHZhciBlbnRyeSA9IGZhY3RMaXN0Ll8wO1xuXHRcdHZhciBrZXkgPSBlbnRyeS5rZXk7XG5cblx0XHRpZiAoa2V5ID09PSBBVFRSX0tFWSB8fCBrZXkgPT09IEFUVFJfTlNfS0VZIHx8IGtleSA9PT0gRVZFTlRfS0VZKVxuXHRcdHtcblx0XHRcdHZhciBzdWJGYWN0cyA9IGZhY3RzW2tleV0gfHwge307XG5cdFx0XHRzdWJGYWN0c1tlbnRyeS5yZWFsS2V5XSA9IGVudHJ5LnZhbHVlO1xuXHRcdFx0ZmFjdHNba2V5XSA9IHN1YkZhY3RzO1xuXHRcdH1cblx0XHRlbHNlIGlmIChrZXkgPT09IFNUWUxFX0tFWSlcblx0XHR7XG5cdFx0XHR2YXIgc3R5bGVzID0gZmFjdHNba2V5XSB8fCB7fTtcblx0XHRcdHZhciBzdHlsZUxpc3QgPSBlbnRyeS52YWx1ZTtcblx0XHRcdHdoaWxlIChzdHlsZUxpc3QuY3RvciAhPT0gJ1tdJylcblx0XHRcdHtcblx0XHRcdFx0dmFyIHN0eWxlID0gc3R5bGVMaXN0Ll8wO1xuXHRcdFx0XHRzdHlsZXNbc3R5bGUuXzBdID0gc3R5bGUuXzE7XG5cdFx0XHRcdHN0eWxlTGlzdCA9IHN0eWxlTGlzdC5fMTtcblx0XHRcdH1cblx0XHRcdGZhY3RzW2tleV0gPSBzdHlsZXM7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGtleSA9PT0gJ25hbWVzcGFjZScpXG5cdFx0e1xuXHRcdFx0bmFtZXNwYWNlID0gZW50cnkudmFsdWU7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRmYWN0c1trZXldID0gZW50cnkudmFsdWU7XG5cdFx0fVxuXHRcdGZhY3RMaXN0ID0gZmFjdExpc3QuXzE7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGZhY3RzOiBmYWN0cyxcblx0XHRuYW1lc3BhY2U6IG5hbWVzcGFjZVxuXHR9O1xufVxuXG5cblxuLy8vLy8vLy8vLy8vICBQUk9QRVJUSUVTIEFORCBBVFRSSUJVVEVTICAvLy8vLy8vLy8vLy9cblxuXG5mdW5jdGlvbiBzdHlsZSh2YWx1ZSlcbntcblx0cmV0dXJuIHtcblx0XHRrZXk6IFNUWUxFX0tFWSxcblx0XHR2YWx1ZTogdmFsdWVcblx0fTtcbn1cblxuXG5mdW5jdGlvbiBwcm9wZXJ0eShrZXksIHZhbHVlKVxue1xuXHRyZXR1cm4ge1xuXHRcdGtleToga2V5LFxuXHRcdHZhbHVlOiB2YWx1ZVxuXHR9O1xufVxuXG5cbmZ1bmN0aW9uIGF0dHJpYnV0ZShrZXksIHZhbHVlKVxue1xuXHRyZXR1cm4ge1xuXHRcdGtleTogQVRUUl9LRVksXG5cdFx0cmVhbEtleToga2V5LFxuXHRcdHZhbHVlOiB2YWx1ZVxuXHR9O1xufVxuXG5cbmZ1bmN0aW9uIGF0dHJpYnV0ZU5TKG5hbWVzcGFjZSwga2V5LCB2YWx1ZSlcbntcblx0cmV0dXJuIHtcblx0XHRrZXk6IEFUVFJfTlNfS0VZLFxuXHRcdHJlYWxLZXk6IGtleSxcblx0XHR2YWx1ZToge1xuXHRcdFx0dmFsdWU6IHZhbHVlLFxuXHRcdFx0bmFtZXNwYWNlOiBuYW1lc3BhY2Vcblx0XHR9XG5cdH07XG59XG5cblxuZnVuY3Rpb24gb24obmFtZSwgb3B0aW9ucywgZGVjb2Rlcilcbntcblx0cmV0dXJuIHtcblx0XHRrZXk6IEVWRU5UX0tFWSxcblx0XHRyZWFsS2V5OiBuYW1lLFxuXHRcdHZhbHVlOiB7XG5cdFx0XHRvcHRpb25zOiBvcHRpb25zLFxuXHRcdFx0ZGVjb2RlcjogZGVjb2RlclxuXHRcdH1cblx0fTtcbn1cblxuXG5mdW5jdGlvbiBlcXVhbEV2ZW50cyhhLCBiKVxue1xuXHRpZiAoIWEub3B0aW9ucyA9PT0gYi5vcHRpb25zKVxuXHR7XG5cdFx0aWYgKGEuc3RvcFByb3BhZ2F0aW9uICE9PSBiLnN0b3BQcm9wYWdhdGlvbiB8fCBhLnByZXZlbnREZWZhdWx0ICE9PSBiLnByZXZlbnREZWZhdWx0KVxuXHRcdHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLmVxdWFsaXR5KGEuZGVjb2RlciwgYi5kZWNvZGVyKTtcbn1cblxuXG5cbi8vLy8vLy8vLy8vLyAgUkVOREVSRVIgIC8vLy8vLy8vLy8vL1xuXG5cbmZ1bmN0aW9uIHJlbmRlcmVyKHBhcmVudCwgdGFnZ2VyLCBpbml0aWFsVmlydHVhbE5vZGUpXG57XG5cdHZhciBldmVudE5vZGUgPSB7IHRhZ2dlcjogdGFnZ2VyLCBwYXJlbnQ6IHVuZGVmaW5lZCB9O1xuXG5cdHZhciBkb21Ob2RlID0gcmVuZGVyKGluaXRpYWxWaXJ0dWFsTm9kZSwgZXZlbnROb2RlKTtcblx0cGFyZW50LmFwcGVuZENoaWxkKGRvbU5vZGUpO1xuXG5cdHZhciBzdGF0ZSA9ICdOT19SRVFVRVNUJztcblx0dmFyIGN1cnJlbnRWaXJ0dWFsTm9kZSA9IGluaXRpYWxWaXJ0dWFsTm9kZTtcblx0dmFyIG5leHRWaXJ0dWFsTm9kZSA9IGluaXRpYWxWaXJ0dWFsTm9kZTtcblxuXHRmdW5jdGlvbiByZWdpc3RlclZpcnR1YWxOb2RlKHZOb2RlKVxuXHR7XG5cdFx0aWYgKHN0YXRlID09PSAnTk9fUkVRVUVTVCcpXG5cdFx0e1xuXHRcdFx0ckFGKHVwZGF0ZUlmTmVlZGVkKTtcblx0XHR9XG5cdFx0c3RhdGUgPSAnUEVORElOR19SRVFVRVNUJztcblx0XHRuZXh0VmlydHVhbE5vZGUgPSB2Tm9kZTtcblx0fVxuXG5cdGZ1bmN0aW9uIHVwZGF0ZUlmTmVlZGVkKClcblx0e1xuXHRcdHN3aXRjaCAoc3RhdGUpXG5cdFx0e1xuXHRcdFx0Y2FzZSAnTk9fUkVRVUVTVCc6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHQnVW5leHBlY3RlZCBkcmF3IGNhbGxiYWNrLlxcbicgK1xuXHRcdFx0XHRcdCdQbGVhc2UgcmVwb3J0IHRoaXMgdG8gPGh0dHBzOi8vZ2l0aHViLmNvbS9lbG0tbGFuZy9jb3JlL2lzc3Vlcz4uJ1xuXHRcdFx0XHQpO1xuXG5cdFx0XHRjYXNlICdQRU5ESU5HX1JFUVVFU1QnOlxuXHRcdFx0XHRyQUYodXBkYXRlSWZOZWVkZWQpO1xuXHRcdFx0XHRzdGF0ZSA9ICdFWFRSQV9SRVFVRVNUJztcblxuXHRcdFx0XHR2YXIgcGF0Y2hlcyA9IGRpZmYoY3VycmVudFZpcnR1YWxOb2RlLCBuZXh0VmlydHVhbE5vZGUpO1xuXHRcdFx0XHRkb21Ob2RlID0gYXBwbHlQYXRjaGVzKGRvbU5vZGUsIGN1cnJlbnRWaXJ0dWFsTm9kZSwgcGF0Y2hlcywgZXZlbnROb2RlKTtcblx0XHRcdFx0Y3VycmVudFZpcnR1YWxOb2RlID0gbmV4dFZpcnR1YWxOb2RlO1xuXG5cdFx0XHRcdHJldHVybjtcblxuXHRcdFx0Y2FzZSAnRVhUUkFfUkVRVUVTVCc6XG5cdFx0XHRcdHN0YXRlID0gJ05PX1JFUVVFU1QnO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHsgdXBkYXRlOiByZWdpc3RlclZpcnR1YWxOb2RlIH07XG59XG5cblxudmFyIHJBRiA9XG5cdHR5cGVvZiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgIT09ICd1bmRlZmluZWQnXG5cdFx0PyByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblx0XHQ6IGZ1bmN0aW9uKGNiKSB7IHNldFRpbWVvdXQoY2IsIDEwMDAgLyA2MCk7IH07XG5cblxuXG4vLy8vLy8vLy8vLy8gIFJFTkRFUiAgLy8vLy8vLy8vLy8vXG5cblxuZnVuY3Rpb24gcmVuZGVyKHZOb2RlLCBldmVudE5vZGUpXG57XG5cdHN3aXRjaCAodk5vZGUudHlwZSlcblx0e1xuXHRcdGNhc2UgJ3RodW5rJzpcblx0XHRcdGlmICghdk5vZGUubm9kZSlcblx0XHRcdHtcblx0XHRcdFx0dk5vZGUubm9kZSA9IHZOb2RlLnRodW5rKCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcmVuZGVyKHZOb2RlLm5vZGUsIGV2ZW50Tm9kZSk7XG5cblx0XHRjYXNlICd0YWdnZXInOlxuXHRcdFx0dmFyIHN1Yk5vZGUgPSB2Tm9kZS5ub2RlO1xuXHRcdFx0dmFyIHRhZ2dlciA9IHZOb2RlLnRhZ2dlcjtcblxuXHRcdFx0d2hpbGUgKHN1Yk5vZGUudHlwZSA9PT0gJ3RhZ2dlcicpXG5cdFx0XHR7XG5cdFx0XHRcdHR5cGVvZiB0YWdnZXIgIT09ICdvYmplY3QnXG5cdFx0XHRcdFx0PyB0YWdnZXIgPSBbdGFnZ2VyLCBzdWJOb2RlLnRhZ2dlcl1cblx0XHRcdFx0XHQ6IHRhZ2dlci5wdXNoKHN1Yk5vZGUudGFnZ2VyKTtcblxuXHRcdFx0XHRzdWJOb2RlID0gc3ViTm9kZS5ub2RlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc3ViRXZlbnRSb290ID0ge1xuXHRcdFx0XHR0YWdnZXI6IHRhZ2dlcixcblx0XHRcdFx0cGFyZW50OiBldmVudE5vZGVcblx0XHRcdH07XG5cblx0XHRcdHZhciBkb21Ob2RlID0gcmVuZGVyKHN1Yk5vZGUsIHN1YkV2ZW50Um9vdCk7XG5cdFx0XHRkb21Ob2RlLmVsbV9ldmVudF9ub2RlX3JlZiA9IHN1YkV2ZW50Um9vdDtcblx0XHRcdHJldHVybiBkb21Ob2RlO1xuXG5cdFx0Y2FzZSAndGV4dCc6XG5cdFx0XHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodk5vZGUudGV4dCk7XG5cblx0XHRjYXNlICdub2RlJzpcblx0XHRcdHZhciBkb21Ob2RlID0gdk5vZGUubmFtZXNwYWNlXG5cdFx0XHRcdD8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHZOb2RlLm5hbWVzcGFjZSwgdk5vZGUudGFnKVxuXHRcdFx0XHQ6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodk5vZGUudGFnKTtcblxuXHRcdFx0YXBwbHlGYWN0cyhkb21Ob2RlLCBldmVudE5vZGUsIHZOb2RlLmZhY3RzKTtcblxuXHRcdFx0dmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW47XG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdGRvbU5vZGUuYXBwZW5kQ2hpbGQocmVuZGVyKGNoaWxkcmVuW2ldLCBldmVudE5vZGUpKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGRvbU5vZGU7XG5cblx0XHRjYXNlICdrZXllZC1ub2RlJzpcblx0XHRcdHZhciBkb21Ob2RlID0gdk5vZGUubmFtZXNwYWNlXG5cdFx0XHRcdD8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHZOb2RlLm5hbWVzcGFjZSwgdk5vZGUudGFnKVxuXHRcdFx0XHQ6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodk5vZGUudGFnKTtcblxuXHRcdFx0YXBwbHlGYWN0cyhkb21Ob2RlLCBldmVudE5vZGUsIHZOb2RlLmZhY3RzKTtcblxuXHRcdFx0dmFyIGNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW47XG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdGRvbU5vZGUuYXBwZW5kQ2hpbGQocmVuZGVyKGNoaWxkcmVuW2ldLl8xLCBldmVudE5vZGUpKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGRvbU5vZGU7XG5cblx0XHRjYXNlICdjdXN0b20nOlxuXHRcdFx0dmFyIGRvbU5vZGUgPSB2Tm9kZS5pbXBsLnJlbmRlcih2Tm9kZS5tb2RlbCk7XG5cdFx0XHRhcHBseUZhY3RzKGRvbU5vZGUsIGV2ZW50Tm9kZSwgdk5vZGUuZmFjdHMpO1xuXHRcdFx0cmV0dXJuIGRvbU5vZGU7XG5cdH1cbn1cblxuXG5cbi8vLy8vLy8vLy8vLyAgQVBQTFkgRkFDVFMgIC8vLy8vLy8vLy8vL1xuXG5cbmZ1bmN0aW9uIGFwcGx5RmFjdHMoZG9tTm9kZSwgZXZlbnROb2RlLCBmYWN0cylcbntcblx0Zm9yICh2YXIga2V5IGluIGZhY3RzKVxuXHR7XG5cdFx0dmFyIHZhbHVlID0gZmFjdHNba2V5XTtcblxuXHRcdHN3aXRjaCAoa2V5KVxuXHRcdHtcblx0XHRcdGNhc2UgU1RZTEVfS0VZOlxuXHRcdFx0XHRhcHBseVN0eWxlcyhkb21Ob2RlLCB2YWx1ZSk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIEVWRU5UX0tFWTpcblx0XHRcdFx0YXBwbHlFdmVudHMoZG9tTm9kZSwgZXZlbnROb2RlLCB2YWx1ZSk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIEFUVFJfS0VZOlxuXHRcdFx0XHRhcHBseUF0dHJzKGRvbU5vZGUsIHZhbHVlKTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgQVRUUl9OU19LRVk6XG5cdFx0XHRcdGFwcGx5QXR0cnNOUyhkb21Ob2RlLCB2YWx1ZSk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlICd2YWx1ZSc6XG5cdFx0XHRcdGlmIChkb21Ob2RlW2tleV0gIT09IHZhbHVlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZG9tTm9kZVtrZXldID0gdmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGRvbU5vZGVba2V5XSA9IHZhbHVlO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gYXBwbHlTdHlsZXMoZG9tTm9kZSwgc3R5bGVzKVxue1xuXHR2YXIgZG9tTm9kZVN0eWxlID0gZG9tTm9kZS5zdHlsZTtcblxuXHRmb3IgKHZhciBrZXkgaW4gc3R5bGVzKVxuXHR7XG5cdFx0ZG9tTm9kZVN0eWxlW2tleV0gPSBzdHlsZXNba2V5XTtcblx0fVxufVxuXG5mdW5jdGlvbiBhcHBseUV2ZW50cyhkb21Ob2RlLCBldmVudE5vZGUsIGV2ZW50cylcbntcblx0dmFyIGFsbEhhbmRsZXJzID0gZG9tTm9kZS5lbG1faGFuZGxlcnMgfHwge307XG5cblx0Zm9yICh2YXIga2V5IGluIGV2ZW50cylcblx0e1xuXHRcdHZhciBoYW5kbGVyID0gYWxsSGFuZGxlcnNba2V5XTtcblx0XHR2YXIgdmFsdWUgPSBldmVudHNba2V5XTtcblxuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKVxuXHRcdHtcblx0XHRcdGRvbU5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihrZXksIGhhbmRsZXIpO1xuXHRcdFx0YWxsSGFuZGxlcnNba2V5XSA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0ZWxzZSBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICd1bmRlZmluZWQnKVxuXHRcdHtcblx0XHRcdHZhciBoYW5kbGVyID0gbWFrZUV2ZW50SGFuZGxlcihldmVudE5vZGUsIHZhbHVlKTtcblx0XHRcdGRvbU5vZGUuYWRkRXZlbnRMaXN0ZW5lcihrZXksIGhhbmRsZXIpO1xuXHRcdFx0YWxsSGFuZGxlcnNba2V5XSA9IGhhbmRsZXI7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRoYW5kbGVyLmluZm8gPSB2YWx1ZTtcblx0XHR9XG5cdH1cblxuXHRkb21Ob2RlLmVsbV9oYW5kbGVycyA9IGFsbEhhbmRsZXJzO1xufVxuXG5mdW5jdGlvbiBtYWtlRXZlbnRIYW5kbGVyKGV2ZW50Tm9kZSwgaW5mbylcbntcblx0ZnVuY3Rpb24gZXZlbnRIYW5kbGVyKGV2ZW50KVxuXHR7XG5cdFx0dmFyIGluZm8gPSBldmVudEhhbmRsZXIuaW5mbztcblxuXHRcdHZhciB2YWx1ZSA9IEEyKF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9Kc29uLnJ1biwgaW5mby5kZWNvZGVyLCBldmVudCk7XG5cblx0XHRpZiAodmFsdWUuY3RvciA9PT0gJ09rJylcblx0XHR7XG5cdFx0XHR2YXIgb3B0aW9ucyA9IGluZm8ub3B0aW9ucztcblx0XHRcdGlmIChvcHRpb25zLnN0b3BQcm9wYWdhdGlvbilcblx0XHRcdHtcblx0XHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAob3B0aW9ucy5wcmV2ZW50RGVmYXVsdClcblx0XHRcdHtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIG1lc3NhZ2UgPSB2YWx1ZS5fMDtcblxuXHRcdFx0dmFyIGN1cnJlbnRFdmVudE5vZGUgPSBldmVudE5vZGU7XG5cdFx0XHR3aGlsZSAoY3VycmVudEV2ZW50Tm9kZSlcblx0XHRcdHtcblx0XHRcdFx0dmFyIHRhZ2dlciA9IGN1cnJlbnRFdmVudE5vZGUudGFnZ2VyO1xuXHRcdFx0XHRpZiAodHlwZW9mIHRhZ2dlciA9PT0gJ2Z1bmN0aW9uJylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG1lc3NhZ2UgPSB0YWdnZXIobWVzc2FnZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IHRhZ2dlci5sZW5ndGg7IGktLTsgKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG1lc3NhZ2UgPSB0YWdnZXJbaV0obWVzc2FnZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGN1cnJlbnRFdmVudE5vZGUgPSBjdXJyZW50RXZlbnROb2RlLnBhcmVudDtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0ZXZlbnRIYW5kbGVyLmluZm8gPSBpbmZvO1xuXG5cdHJldHVybiBldmVudEhhbmRsZXI7XG59XG5cbmZ1bmN0aW9uIGFwcGx5QXR0cnMoZG9tTm9kZSwgYXR0cnMpXG57XG5cdGZvciAodmFyIGtleSBpbiBhdHRycylcblx0e1xuXHRcdHZhciB2YWx1ZSA9IGF0dHJzW2tleV07XG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpXG5cdFx0e1xuXHRcdFx0ZG9tTm9kZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGRvbU5vZGUuc2V0QXR0cmlidXRlKGtleSwgdmFsdWUpO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBhcHBseUF0dHJzTlMoZG9tTm9kZSwgbnNBdHRycylcbntcblx0Zm9yICh2YXIga2V5IGluIG5zQXR0cnMpXG5cdHtcblx0XHR2YXIgcGFpciA9IG5zQXR0cnNba2V5XTtcblx0XHR2YXIgbmFtZXNwYWNlID0gcGFpci5uYW1lc3BhY2U7XG5cdFx0dmFyIHZhbHVlID0gcGFpci52YWx1ZTtcblxuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKVxuXHRcdHtcblx0XHRcdGRvbU5vZGUucmVtb3ZlQXR0cmlidXRlTlMobmFtZXNwYWNlLCBrZXkpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0ZG9tTm9kZS5zZXRBdHRyaWJ1dGVOUyhuYW1lc3BhY2UsIGtleSwgdmFsdWUpO1xuXHRcdH1cblx0fVxufVxuXG5cblxuLy8vLy8vLy8vLy8vICBESUZGICAvLy8vLy8vLy8vLy9cblxuXG5mdW5jdGlvbiBkaWZmKGEsIGIpXG57XG5cdHZhciBwYXRjaGVzID0gW107XG5cdGRpZmZIZWxwKGEsIGIsIHBhdGNoZXMsIDApO1xuXHRyZXR1cm4gcGF0Y2hlcztcbn1cblxuXG5mdW5jdGlvbiBtYWtlUGF0Y2godHlwZSwgaW5kZXgsIGRhdGEpXG57XG5cdHJldHVybiB7XG5cdFx0aW5kZXg6IGluZGV4LFxuXHRcdHR5cGU6IHR5cGUsXG5cdFx0ZGF0YTogZGF0YSxcblx0XHRkb21Ob2RlOiB1bmRlZmluZWQsXG5cdFx0ZXZlbnROb2RlOiB1bmRlZmluZWRcblx0fTtcbn1cblxuXG5mdW5jdGlvbiBkaWZmSGVscChhLCBiLCBwYXRjaGVzLCBpbmRleClcbntcblx0aWYgKGEgPT09IGIpXG5cdHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR2YXIgYVR5cGUgPSBhLnR5cGU7XG5cdHZhciBiVHlwZSA9IGIudHlwZTtcblxuXHQvLyBCYWlsIGlmIHlvdSBydW4gaW50byBkaWZmZXJlbnQgdHlwZXMgb2Ygbm9kZXMuIEltcGxpZXMgdGhhdCB0aGVcblx0Ly8gc3RydWN0dXJlIGhhcyBjaGFuZ2VkIHNpZ25pZmljYW50bHkgYW5kIGl0J3Mgbm90IHdvcnRoIGEgZGlmZi5cblx0aWYgKGFUeXBlICE9PSBiVHlwZSlcblx0e1xuXHRcdHBhdGNoZXMucHVzaChtYWtlUGF0Y2goJ3AtcmVkcmF3JywgaW5kZXgsIGIpKTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyBOb3cgd2Uga25vdyB0aGF0IGJvdGggbm9kZXMgYXJlIHRoZSBzYW1lIHR5cGUuXG5cdHN3aXRjaCAoYlR5cGUpXG5cdHtcblx0XHRjYXNlICd0aHVuayc6XG5cdFx0XHR2YXIgYUFyZ3MgPSBhLmFyZ3M7XG5cdFx0XHR2YXIgYkFyZ3MgPSBiLmFyZ3M7XG5cdFx0XHR2YXIgaSA9IGFBcmdzLmxlbmd0aDtcblx0XHRcdHZhciBzYW1lID0gYS5mdW5jID09PSBiLmZ1bmMgJiYgaSA9PT0gYkFyZ3MubGVuZ3RoO1xuXHRcdFx0d2hpbGUgKHNhbWUgJiYgaS0tKVxuXHRcdFx0e1xuXHRcdFx0XHRzYW1lID0gYUFyZ3NbaV0gPT09IGJBcmdzW2ldO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHNhbWUpXG5cdFx0XHR7XG5cdFx0XHRcdGIubm9kZSA9IGEubm9kZTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Yi5ub2RlID0gYi50aHVuaygpO1xuXHRcdFx0dmFyIHN1YlBhdGNoZXMgPSBbXTtcblx0XHRcdGRpZmZIZWxwKGEubm9kZSwgYi5ub2RlLCBzdWJQYXRjaGVzLCAwKTtcblx0XHRcdGlmIChzdWJQYXRjaGVzLmxlbmd0aCA+IDApXG5cdFx0XHR7XG5cdFx0XHRcdHBhdGNoZXMucHVzaChtYWtlUGF0Y2goJ3AtdGh1bmsnLCBpbmRleCwgc3ViUGF0Y2hlcykpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Y2FzZSAndGFnZ2VyJzpcblx0XHRcdC8vIGdhdGhlciBuZXN0ZWQgdGFnZ2Vyc1xuXHRcdFx0dmFyIGFUYWdnZXJzID0gYS50YWdnZXI7XG5cdFx0XHR2YXIgYlRhZ2dlcnMgPSBiLnRhZ2dlcjtcblx0XHRcdHZhciBuZXN0aW5nID0gZmFsc2U7XG5cblx0XHRcdHZhciBhU3ViTm9kZSA9IGEubm9kZTtcblx0XHRcdHdoaWxlIChhU3ViTm9kZS50eXBlID09PSAndGFnZ2VyJylcblx0XHRcdHtcblx0XHRcdFx0bmVzdGluZyA9IHRydWU7XG5cblx0XHRcdFx0dHlwZW9mIGFUYWdnZXJzICE9PSAnb2JqZWN0J1xuXHRcdFx0XHRcdD8gYVRhZ2dlcnMgPSBbYVRhZ2dlcnMsIGFTdWJOb2RlLnRhZ2dlcl1cblx0XHRcdFx0XHQ6IGFUYWdnZXJzLnB1c2goYVN1Yk5vZGUudGFnZ2VyKTtcblxuXHRcdFx0XHRhU3ViTm9kZSA9IGFTdWJOb2RlLm5vZGU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBiU3ViTm9kZSA9IGIubm9kZTtcblx0XHRcdHdoaWxlIChiU3ViTm9kZS50eXBlID09PSAndGFnZ2VyJylcblx0XHRcdHtcblx0XHRcdFx0bmVzdGluZyA9IHRydWU7XG5cblx0XHRcdFx0dHlwZW9mIGJUYWdnZXJzICE9PSAnb2JqZWN0J1xuXHRcdFx0XHRcdD8gYlRhZ2dlcnMgPSBbYlRhZ2dlcnMsIGJTdWJOb2RlLnRhZ2dlcl1cblx0XHRcdFx0XHQ6IGJUYWdnZXJzLnB1c2goYlN1Yk5vZGUudGFnZ2VyKTtcblxuXHRcdFx0XHRiU3ViTm9kZSA9IGJTdWJOb2RlLm5vZGU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEp1c3QgYmFpbCBpZiBkaWZmZXJlbnQgbnVtYmVycyBvZiB0YWdnZXJzLiBUaGlzIGltcGxpZXMgdGhlXG5cdFx0XHQvLyBzdHJ1Y3R1cmUgb2YgdGhlIHZpcnR1YWwgRE9NIGhhcyBjaGFuZ2VkLlxuXHRcdFx0aWYgKG5lc3RpbmcgJiYgYVRhZ2dlcnMubGVuZ3RoICE9PSBiVGFnZ2Vycy5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdHBhdGNoZXMucHVzaChtYWtlUGF0Y2goJ3AtcmVkcmF3JywgaW5kZXgsIGIpKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBjaGVjayBpZiB0YWdnZXJzIGFyZSBcInRoZSBzYW1lXCJcblx0XHRcdGlmIChuZXN0aW5nID8gIXBhaXJ3aXNlUmVmRXF1YWwoYVRhZ2dlcnMsIGJUYWdnZXJzKSA6IGFUYWdnZXJzICE9PSBiVGFnZ2Vycylcblx0XHRcdHtcblx0XHRcdFx0cGF0Y2hlcy5wdXNoKG1ha2VQYXRjaCgncC10YWdnZXInLCBpbmRleCwgYlRhZ2dlcnMpKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gZGlmZiBldmVyeXRoaW5nIGJlbG93IHRoZSB0YWdnZXJzXG5cdFx0XHRkaWZmSGVscChhU3ViTm9kZSwgYlN1Yk5vZGUsIHBhdGNoZXMsIGluZGV4ICsgMSk7XG5cdFx0XHRyZXR1cm47XG5cblx0XHRjYXNlICd0ZXh0Jzpcblx0XHRcdGlmIChhLnRleHQgIT09IGIudGV4dClcblx0XHRcdHtcblx0XHRcdFx0cGF0Y2hlcy5wdXNoKG1ha2VQYXRjaCgncC10ZXh0JywgaW5kZXgsIGIudGV4dCkpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblxuXHRcdGNhc2UgJ25vZGUnOlxuXHRcdFx0Ly8gQmFpbCBpZiBvYnZpb3VzIGluZGljYXRvcnMgaGF2ZSBjaGFuZ2VkLiBJbXBsaWVzIG1vcmUgc2VyaW91c1xuXHRcdFx0Ly8gc3RydWN0dXJhbCBjaGFuZ2VzIHN1Y2ggdGhhdCBpdCdzIG5vdCB3b3J0aCBpdCB0byBkaWZmLlxuXHRcdFx0aWYgKGEudGFnICE9PSBiLnRhZyB8fCBhLm5hbWVzcGFjZSAhPT0gYi5uYW1lc3BhY2UpXG5cdFx0XHR7XG5cdFx0XHRcdHBhdGNoZXMucHVzaChtYWtlUGF0Y2goJ3AtcmVkcmF3JywgaW5kZXgsIGIpKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgZmFjdHNEaWZmID0gZGlmZkZhY3RzKGEuZmFjdHMsIGIuZmFjdHMpO1xuXG5cdFx0XHRpZiAodHlwZW9mIGZhY3RzRGlmZiAhPT0gJ3VuZGVmaW5lZCcpXG5cdFx0XHR7XG5cdFx0XHRcdHBhdGNoZXMucHVzaChtYWtlUGF0Y2goJ3AtZmFjdHMnLCBpbmRleCwgZmFjdHNEaWZmKSk7XG5cdFx0XHR9XG5cblx0XHRcdGRpZmZDaGlsZHJlbihhLCBiLCBwYXRjaGVzLCBpbmRleCk7XG5cdFx0XHRyZXR1cm47XG5cblx0XHRjYXNlICdrZXllZC1ub2RlJzpcblx0XHRcdC8vIEJhaWwgaWYgb2J2aW91cyBpbmRpY2F0b3JzIGhhdmUgY2hhbmdlZC4gSW1wbGllcyBtb3JlIHNlcmlvdXNcblx0XHRcdC8vIHN0cnVjdHVyYWwgY2hhbmdlcyBzdWNoIHRoYXQgaXQncyBub3Qgd29ydGggaXQgdG8gZGlmZi5cblx0XHRcdGlmIChhLnRhZyAhPT0gYi50YWcgfHwgYS5uYW1lc3BhY2UgIT09IGIubmFtZXNwYWNlKVxuXHRcdFx0e1xuXHRcdFx0XHRwYXRjaGVzLnB1c2gobWFrZVBhdGNoKCdwLXJlZHJhdycsIGluZGV4LCBiKSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGZhY3RzRGlmZiA9IGRpZmZGYWN0cyhhLmZhY3RzLCBiLmZhY3RzKTtcblxuXHRcdFx0aWYgKHR5cGVvZiBmYWN0c0RpZmYgIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0e1xuXHRcdFx0XHRwYXRjaGVzLnB1c2gobWFrZVBhdGNoKCdwLWZhY3RzJywgaW5kZXgsIGZhY3RzRGlmZikpO1xuXHRcdFx0fVxuXG5cdFx0XHRkaWZmS2V5ZWRDaGlsZHJlbihhLCBiLCBwYXRjaGVzLCBpbmRleCk7XG5cdFx0XHRyZXR1cm47XG5cblx0XHRjYXNlICdjdXN0b20nOlxuXHRcdFx0aWYgKGEuaW1wbCAhPT0gYi5pbXBsKVxuXHRcdFx0e1xuXHRcdFx0XHRwYXRjaGVzLnB1c2gobWFrZVBhdGNoKCdwLXJlZHJhdycsIGluZGV4LCBiKSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGZhY3RzRGlmZiA9IGRpZmZGYWN0cyhhLmZhY3RzLCBiLmZhY3RzKTtcblx0XHRcdGlmICh0eXBlb2YgZmFjdHNEaWZmICE9PSAndW5kZWZpbmVkJylcblx0XHRcdHtcblx0XHRcdFx0cGF0Y2hlcy5wdXNoKG1ha2VQYXRjaCgncC1mYWN0cycsIGluZGV4LCBmYWN0c0RpZmYpKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHBhdGNoID0gYi5pbXBsLmRpZmYoYSxiKTtcblx0XHRcdGlmIChwYXRjaClcblx0XHRcdHtcblx0XHRcdFx0cGF0Y2hlcy5wdXNoKG1ha2VQYXRjaCgncC1jdXN0b20nLCBpbmRleCwgcGF0Y2gpKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm47XG5cdH1cbn1cblxuXG4vLyBhc3N1bWVzIHRoZSBpbmNvbWluZyBhcnJheXMgYXJlIHRoZSBzYW1lIGxlbmd0aFxuZnVuY3Rpb24gcGFpcndpc2VSZWZFcXVhbChhcywgYnMpXG57XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYXMubGVuZ3RoOyBpKyspXG5cdHtcblx0XHRpZiAoYXNbaV0gIT09IGJzW2ldKVxuXHRcdHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdHJ1ZTtcbn1cblxuXG4vLyBUT0RPIEluc3RlYWQgb2YgY3JlYXRpbmcgYSBuZXcgZGlmZiBvYmplY3QsIGl0J3MgcG9zc2libGUgdG8ganVzdCB0ZXN0IGlmXG4vLyB0aGVyZSAqaXMqIGEgZGlmZi4gRHVyaW5nIHRoZSBhY3R1YWwgcGF0Y2gsIGRvIHRoZSBkaWZmIGFnYWluIGFuZCBtYWtlIHRoZVxuLy8gbW9kaWZpY2F0aW9ucyBkaXJlY3RseS4gVGhpcyB3YXksIHRoZXJlJ3Mgbm8gbmV3IGFsbG9jYXRpb25zLiBXb3J0aCBpdD9cbmZ1bmN0aW9uIGRpZmZGYWN0cyhhLCBiLCBjYXRlZ29yeSlcbntcblx0dmFyIGRpZmY7XG5cblx0Ly8gbG9vayBmb3IgY2hhbmdlcyBhbmQgcmVtb3ZhbHNcblx0Zm9yICh2YXIgYUtleSBpbiBhKVxuXHR7XG5cdFx0aWYgKGFLZXkgPT09IFNUWUxFX0tFWSB8fCBhS2V5ID09PSBFVkVOVF9LRVkgfHwgYUtleSA9PT0gQVRUUl9LRVkgfHwgYUtleSA9PT0gQVRUUl9OU19LRVkpXG5cdFx0e1xuXHRcdFx0dmFyIHN1YkRpZmYgPSBkaWZmRmFjdHMoYVthS2V5XSwgYlthS2V5XSB8fCB7fSwgYUtleSk7XG5cdFx0XHRpZiAoc3ViRGlmZilcblx0XHRcdHtcblx0XHRcdFx0ZGlmZiA9IGRpZmYgfHwge307XG5cdFx0XHRcdGRpZmZbYUtleV0gPSBzdWJEaWZmO1xuXHRcdFx0fVxuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0Ly8gcmVtb3ZlIGlmIG5vdCBpbiB0aGUgbmV3IGZhY3RzXG5cdFx0aWYgKCEoYUtleSBpbiBiKSlcblx0XHR7XG5cdFx0XHRkaWZmID0gZGlmZiB8fCB7fTtcblx0XHRcdGRpZmZbYUtleV0gPVxuXHRcdFx0XHQodHlwZW9mIGNhdGVnb3J5ID09PSAndW5kZWZpbmVkJylcblx0XHRcdFx0XHQ/ICh0eXBlb2YgYVthS2V5XSA9PT0gJ3N0cmluZycgPyAnJyA6IG51bGwpXG5cdFx0XHRcdFx0OlxuXHRcdFx0XHQoY2F0ZWdvcnkgPT09IFNUWUxFX0tFWSlcblx0XHRcdFx0XHQ/ICcnXG5cdFx0XHRcdFx0OlxuXHRcdFx0XHQoY2F0ZWdvcnkgPT09IEVWRU5UX0tFWSB8fCBjYXRlZ29yeSA9PT0gQVRUUl9LRVkpXG5cdFx0XHRcdFx0PyB1bmRlZmluZWRcblx0XHRcdFx0XHQ6XG5cdFx0XHRcdHsgbmFtZXNwYWNlOiBhW2FLZXldLm5hbWVzcGFjZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuXG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHR2YXIgYVZhbHVlID0gYVthS2V5XTtcblx0XHR2YXIgYlZhbHVlID0gYlthS2V5XTtcblxuXHRcdC8vIHJlZmVyZW5jZSBlcXVhbCwgc28gZG9uJ3Qgd29ycnkgYWJvdXQgaXRcblx0XHRpZiAoYVZhbHVlID09PSBiVmFsdWUgJiYgYUtleSAhPT0gJ3ZhbHVlJ1xuXHRcdFx0fHwgY2F0ZWdvcnkgPT09IEVWRU5UX0tFWSAmJiBlcXVhbEV2ZW50cyhhVmFsdWUsIGJWYWx1ZSkpXG5cdFx0e1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0ZGlmZiA9IGRpZmYgfHwge307XG5cdFx0ZGlmZlthS2V5XSA9IGJWYWx1ZTtcblx0fVxuXG5cdC8vIGFkZCBuZXcgc3R1ZmZcblx0Zm9yICh2YXIgYktleSBpbiBiKVxuXHR7XG5cdFx0aWYgKCEoYktleSBpbiBhKSlcblx0XHR7XG5cdFx0XHRkaWZmID0gZGlmZiB8fCB7fTtcblx0XHRcdGRpZmZbYktleV0gPSBiW2JLZXldO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBkaWZmO1xufVxuXG5cbmZ1bmN0aW9uIGRpZmZDaGlsZHJlbihhUGFyZW50LCBiUGFyZW50LCBwYXRjaGVzLCByb290SW5kZXgpXG57XG5cdHZhciBhQ2hpbGRyZW4gPSBhUGFyZW50LmNoaWxkcmVuO1xuXHR2YXIgYkNoaWxkcmVuID0gYlBhcmVudC5jaGlsZHJlbjtcblxuXHR2YXIgYUxlbiA9IGFDaGlsZHJlbi5sZW5ndGg7XG5cdHZhciBiTGVuID0gYkNoaWxkcmVuLmxlbmd0aDtcblxuXHQvLyBGSUdVUkUgT1VUIElGIFRIRVJFIEFSRSBJTlNFUlRTIE9SIFJFTU9WQUxTXG5cblx0aWYgKGFMZW4gPiBiTGVuKVxuXHR7XG5cdFx0cGF0Y2hlcy5wdXNoKG1ha2VQYXRjaCgncC1yZW1vdmUtbGFzdCcsIHJvb3RJbmRleCwgYUxlbiAtIGJMZW4pKTtcblx0fVxuXHRlbHNlIGlmIChhTGVuIDwgYkxlbilcblx0e1xuXHRcdHBhdGNoZXMucHVzaChtYWtlUGF0Y2goJ3AtYXBwZW5kJywgcm9vdEluZGV4LCBiQ2hpbGRyZW4uc2xpY2UoYUxlbikpKTtcblx0fVxuXG5cdC8vIFBBSVJXSVNFIERJRkYgRVZFUllUSElORyBFTFNFXG5cblx0dmFyIGluZGV4ID0gcm9vdEluZGV4O1xuXHR2YXIgbWluTGVuID0gYUxlbiA8IGJMZW4gPyBhTGVuIDogYkxlbjtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBtaW5MZW47IGkrKylcblx0e1xuXHRcdGluZGV4Kys7XG5cdFx0dmFyIGFDaGlsZCA9IGFDaGlsZHJlbltpXTtcblx0XHRkaWZmSGVscChhQ2hpbGQsIGJDaGlsZHJlbltpXSwgcGF0Y2hlcywgaW5kZXgpO1xuXHRcdGluZGV4ICs9IGFDaGlsZC5kZXNjZW5kYW50c0NvdW50IHx8IDA7XG5cdH1cbn1cblxuXG5cbi8vLy8vLy8vLy8vLyAgS0VZRUQgRElGRiAgLy8vLy8vLy8vLy8vXG5cblxuZnVuY3Rpb24gZGlmZktleWVkQ2hpbGRyZW4oYVBhcmVudCwgYlBhcmVudCwgcGF0Y2hlcywgcm9vdEluZGV4KVxue1xuXHR2YXIgbG9jYWxQYXRjaGVzID0gW107XG5cblx0dmFyIGNoYW5nZXMgPSB7fTsgLy8gRGljdCBTdHJpbmcgRW50cnlcblx0dmFyIGluc2VydHMgPSBbXTsgLy8gQXJyYXkgeyBpbmRleCA6IEludCwgZW50cnkgOiBFbnRyeSB9XG5cdC8vIHR5cGUgRW50cnkgPSB7IHRhZyA6IFN0cmluZywgdm5vZGUgOiBWTm9kZSwgaW5kZXggOiBJbnQsIGRhdGEgOiBfIH1cblxuXHR2YXIgYUNoaWxkcmVuID0gYVBhcmVudC5jaGlsZHJlbjtcblx0dmFyIGJDaGlsZHJlbiA9IGJQYXJlbnQuY2hpbGRyZW47XG5cdHZhciBhTGVuID0gYUNoaWxkcmVuLmxlbmd0aDtcblx0dmFyIGJMZW4gPSBiQ2hpbGRyZW4ubGVuZ3RoO1xuXHR2YXIgYUluZGV4ID0gMDtcblx0dmFyIGJJbmRleCA9IDA7XG5cblx0dmFyIGluZGV4ID0gcm9vdEluZGV4O1xuXG5cdHdoaWxlIChhSW5kZXggPCBhTGVuICYmIGJJbmRleCA8IGJMZW4pXG5cdHtcblx0XHR2YXIgYSA9IGFDaGlsZHJlblthSW5kZXhdO1xuXHRcdHZhciBiID0gYkNoaWxkcmVuW2JJbmRleF07XG5cblx0XHR2YXIgYUtleSA9IGEuXzA7XG5cdFx0dmFyIGJLZXkgPSBiLl8wO1xuXHRcdHZhciBhTm9kZSA9IGEuXzE7XG5cdFx0dmFyIGJOb2RlID0gYi5fMTtcblxuXHRcdC8vIGNoZWNrIGlmIGtleXMgbWF0Y2hcblxuXHRcdGlmIChhS2V5ID09PSBiS2V5KVxuXHRcdHtcblx0XHRcdGluZGV4Kys7XG5cdFx0XHRkaWZmSGVscChhTm9kZSwgYk5vZGUsIGxvY2FsUGF0Y2hlcywgaW5kZXgpO1xuXHRcdFx0aW5kZXggKz0gYU5vZGUuZGVzY2VuZGFudHNDb3VudCB8fCAwO1xuXG5cdFx0XHRhSW5kZXgrKztcblx0XHRcdGJJbmRleCsrO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0Ly8gbG9vayBhaGVhZCAxIHRvIGRldGVjdCBpbnNlcnRpb25zIGFuZCByZW1vdmFscy5cblxuXHRcdHZhciBhTG9va0FoZWFkID0gYUluZGV4ICsgMSA8IGFMZW47XG5cdFx0dmFyIGJMb29rQWhlYWQgPSBiSW5kZXggKyAxIDwgYkxlbjtcblxuXHRcdGlmIChhTG9va0FoZWFkKVxuXHRcdHtcblx0XHRcdHZhciBhTmV4dCA9IGFDaGlsZHJlblthSW5kZXggKyAxXTtcblx0XHRcdHZhciBhTmV4dEtleSA9IGFOZXh0Ll8wO1xuXHRcdFx0dmFyIGFOZXh0Tm9kZSA9IGFOZXh0Ll8xO1xuXHRcdFx0dmFyIG9sZE1hdGNoID0gYktleSA9PT0gYU5leHRLZXk7XG5cdFx0fVxuXG5cdFx0aWYgKGJMb29rQWhlYWQpXG5cdFx0e1xuXHRcdFx0dmFyIGJOZXh0ID0gYkNoaWxkcmVuW2JJbmRleCArIDFdO1xuXHRcdFx0dmFyIGJOZXh0S2V5ID0gYk5leHQuXzA7XG5cdFx0XHR2YXIgYk5leHROb2RlID0gYk5leHQuXzE7XG5cdFx0XHR2YXIgbmV3TWF0Y2ggPSBhS2V5ID09PSBiTmV4dEtleTtcblx0XHR9XG5cblxuXHRcdC8vIHN3YXAgYSBhbmQgYlxuXHRcdGlmIChhTG9va0FoZWFkICYmIGJMb29rQWhlYWQgJiYgbmV3TWF0Y2ggJiYgb2xkTWF0Y2gpXG5cdFx0e1xuXHRcdFx0aW5kZXgrKztcblx0XHRcdGRpZmZIZWxwKGFOb2RlLCBiTmV4dE5vZGUsIGxvY2FsUGF0Y2hlcywgaW5kZXgpO1xuXHRcdFx0aW5zZXJ0Tm9kZShjaGFuZ2VzLCBsb2NhbFBhdGNoZXMsIGFLZXksIGJOb2RlLCBiSW5kZXgsIGluc2VydHMpO1xuXHRcdFx0aW5kZXggKz0gYU5vZGUuZGVzY2VuZGFudHNDb3VudCB8fCAwO1xuXG5cdFx0XHRpbmRleCsrO1xuXHRcdFx0cmVtb3ZlTm9kZShjaGFuZ2VzLCBsb2NhbFBhdGNoZXMsIGFLZXksIGFOZXh0Tm9kZSwgaW5kZXgpO1xuXHRcdFx0aW5kZXggKz0gYU5leHROb2RlLmRlc2NlbmRhbnRzQ291bnQgfHwgMDtcblxuXHRcdFx0YUluZGV4ICs9IDI7XG5cdFx0XHRiSW5kZXggKz0gMjtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdC8vIGluc2VydCBiXG5cdFx0aWYgKGJMb29rQWhlYWQgJiYgbmV3TWF0Y2gpXG5cdFx0e1xuXHRcdFx0aW5kZXgrKztcblx0XHRcdGluc2VydE5vZGUoY2hhbmdlcywgbG9jYWxQYXRjaGVzLCBiS2V5LCBiTm9kZSwgYkluZGV4LCBpbnNlcnRzKTtcblx0XHRcdGRpZmZIZWxwKGFOb2RlLCBiTmV4dE5vZGUsIGxvY2FsUGF0Y2hlcywgaW5kZXgpO1xuXHRcdFx0aW5kZXggKz0gYU5vZGUuZGVzY2VuZGFudHNDb3VudCB8fCAwO1xuXG5cdFx0XHRhSW5kZXggKz0gMTtcblx0XHRcdGJJbmRleCArPSAyO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0Ly8gcmVtb3ZlIGFcblx0XHRpZiAoYUxvb2tBaGVhZCAmJiBvbGRNYXRjaClcblx0XHR7XG5cdFx0XHRpbmRleCsrO1xuXHRcdFx0cmVtb3ZlTm9kZShjaGFuZ2VzLCBsb2NhbFBhdGNoZXMsIGFLZXksIGFOb2RlLCBpbmRleCk7XG5cdFx0XHRpbmRleCArPSBhTm9kZS5kZXNjZW5kYW50c0NvdW50IHx8IDA7XG5cblx0XHRcdGluZGV4Kys7XG5cdFx0XHRkaWZmSGVscChhTmV4dE5vZGUsIGJOb2RlLCBsb2NhbFBhdGNoZXMsIGluZGV4KTtcblx0XHRcdGluZGV4ICs9IGFOZXh0Tm9kZS5kZXNjZW5kYW50c0NvdW50IHx8IDA7XG5cblx0XHRcdGFJbmRleCArPSAyO1xuXHRcdFx0YkluZGV4ICs9IDE7XG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHQvLyByZW1vdmUgYSwgaW5zZXJ0IGJcblx0XHRpZiAoYUxvb2tBaGVhZCAmJiBiTG9va0FoZWFkICYmIGFOZXh0S2V5ID09PSBiTmV4dEtleSlcblx0XHR7XG5cdFx0XHRpbmRleCsrO1xuXHRcdFx0cmVtb3ZlTm9kZShjaGFuZ2VzLCBsb2NhbFBhdGNoZXMsIGFLZXksIGFOb2RlLCBpbmRleCk7XG5cdFx0XHRpbnNlcnROb2RlKGNoYW5nZXMsIGxvY2FsUGF0Y2hlcywgYktleSwgYk5vZGUsIGJJbmRleCwgaW5zZXJ0cyk7XG5cdFx0XHRpbmRleCArPSBhTm9kZS5kZXNjZW5kYW50c0NvdW50IHx8IDA7XG5cblx0XHRcdGluZGV4Kys7XG5cdFx0XHRkaWZmSGVscChhTmV4dE5vZGUsIGJOZXh0Tm9kZSwgbG9jYWxQYXRjaGVzLCBpbmRleCk7XG5cdFx0XHRpbmRleCArPSBhTmV4dE5vZGUuZGVzY2VuZGFudHNDb3VudCB8fCAwO1xuXG5cdFx0XHRhSW5kZXggKz0gMjtcblx0XHRcdGJJbmRleCArPSAyO1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0YnJlYWs7XG5cdH1cblxuXHQvLyBlYXQgdXAgYW55IHJlbWFpbmluZyBub2RlcyB3aXRoIHJlbW92ZU5vZGUgYW5kIGluc2VydE5vZGVcblxuXHR3aGlsZSAoYUluZGV4IDwgYUxlbilcblx0e1xuXHRcdGluZGV4Kys7XG5cdFx0dmFyIGEgPSBhQ2hpbGRyZW5bYUluZGV4XTtcblx0XHR2YXIgYU5vZGUgPSBhLl8xO1xuXHRcdHJlbW92ZU5vZGUoY2hhbmdlcywgbG9jYWxQYXRjaGVzLCBhLl8wLCBhTm9kZSwgaW5kZXgpO1xuXHRcdGluZGV4ICs9IGFOb2RlLmRlc2NlbmRhbnRzQ291bnQgfHwgMDtcblx0XHRhSW5kZXgrKztcblx0fVxuXG5cdHZhciBlbmRJbnNlcnRzO1xuXHR3aGlsZSAoYkluZGV4IDwgYkxlbilcblx0e1xuXHRcdGVuZEluc2VydHMgPSBlbmRJbnNlcnRzIHx8IFtdO1xuXHRcdHZhciBiID0gYkNoaWxkcmVuW2JJbmRleF07XG5cdFx0aW5zZXJ0Tm9kZShjaGFuZ2VzLCBsb2NhbFBhdGNoZXMsIGIuXzAsIGIuXzEsIHVuZGVmaW5lZCwgZW5kSW5zZXJ0cyk7XG5cdFx0YkluZGV4Kys7XG5cdH1cblxuXHRpZiAobG9jYWxQYXRjaGVzLmxlbmd0aCA+IDAgfHwgaW5zZXJ0cy5sZW5ndGggPiAwIHx8IHR5cGVvZiBlbmRJbnNlcnRzICE9PSAndW5kZWZpbmVkJylcblx0e1xuXHRcdHBhdGNoZXMucHVzaChtYWtlUGF0Y2goJ3AtcmVvcmRlcicsIHJvb3RJbmRleCwge1xuXHRcdFx0cGF0Y2hlczogbG9jYWxQYXRjaGVzLFxuXHRcdFx0aW5zZXJ0czogaW5zZXJ0cyxcblx0XHRcdGVuZEluc2VydHM6IGVuZEluc2VydHNcblx0XHR9KSk7XG5cdH1cbn1cblxuXG5cbi8vLy8vLy8vLy8vLyAgQ0hBTkdFUyBGUk9NIEtFWUVEIERJRkYgIC8vLy8vLy8vLy8vL1xuXG5cbnZhciBQT1NURklYID0gJ19lbG1XNkJMJztcblxuXG5mdW5jdGlvbiBpbnNlcnROb2RlKGNoYW5nZXMsIGxvY2FsUGF0Y2hlcywga2V5LCB2bm9kZSwgYkluZGV4LCBpbnNlcnRzKVxue1xuXHR2YXIgZW50cnkgPSBjaGFuZ2VzW2tleV07XG5cblx0Ly8gbmV2ZXIgc2VlbiB0aGlzIGtleSBiZWZvcmVcblx0aWYgKHR5cGVvZiBlbnRyeSA9PT0gJ3VuZGVmaW5lZCcpXG5cdHtcblx0XHRlbnRyeSA9IHtcblx0XHRcdHRhZzogJ2luc2VydCcsXG5cdFx0XHR2bm9kZTogdm5vZGUsXG5cdFx0XHRpbmRleDogYkluZGV4LFxuXHRcdFx0ZGF0YTogdW5kZWZpbmVkXG5cdFx0fTtcblxuXHRcdGluc2VydHMucHVzaCh7IGluZGV4OiBiSW5kZXgsIGVudHJ5OiBlbnRyeSB9KTtcblx0XHRjaGFuZ2VzW2tleV0gPSBlbnRyeTtcblxuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIHRoaXMga2V5IHdhcyByZW1vdmVkIGVhcmxpZXIsIGEgbWF0Y2ghXG5cdGlmIChlbnRyeS50YWcgPT09ICdyZW1vdmUnKVxuXHR7XG5cdFx0aW5zZXJ0cy5wdXNoKHsgaW5kZXg6IGJJbmRleCwgZW50cnk6IGVudHJ5IH0pO1xuXG5cdFx0ZW50cnkudGFnID0gJ21vdmUnO1xuXHRcdHZhciBzdWJQYXRjaGVzID0gW107XG5cdFx0ZGlmZkhlbHAoZW50cnkudm5vZGUsIHZub2RlLCBzdWJQYXRjaGVzLCBlbnRyeS5pbmRleCk7XG5cdFx0ZW50cnkuaW5kZXggPSBiSW5kZXg7XG5cdFx0ZW50cnkuZGF0YS5kYXRhID0ge1xuXHRcdFx0cGF0Y2hlczogc3ViUGF0Y2hlcyxcblx0XHRcdGVudHJ5OiBlbnRyeVxuXHRcdH07XG5cblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyB0aGlzIGtleSBoYXMgYWxyZWFkeSBiZWVuIGluc2VydGVkIG9yIG1vdmVkLCBhIGR1cGxpY2F0ZSFcblx0aW5zZXJ0Tm9kZShjaGFuZ2VzLCBsb2NhbFBhdGNoZXMsIGtleSArIFBPU1RGSVgsIHZub2RlLCBiSW5kZXgsIGluc2VydHMpO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU5vZGUoY2hhbmdlcywgbG9jYWxQYXRjaGVzLCBrZXksIHZub2RlLCBpbmRleClcbntcblx0dmFyIGVudHJ5ID0gY2hhbmdlc1trZXldO1xuXG5cdC8vIG5ldmVyIHNlZW4gdGhpcyBrZXkgYmVmb3JlXG5cdGlmICh0eXBlb2YgZW50cnkgPT09ICd1bmRlZmluZWQnKVxuXHR7XG5cdFx0dmFyIHBhdGNoID0gbWFrZVBhdGNoKCdwLXJlbW92ZScsIGluZGV4LCB1bmRlZmluZWQpO1xuXHRcdGxvY2FsUGF0Y2hlcy5wdXNoKHBhdGNoKTtcblxuXHRcdGNoYW5nZXNba2V5XSA9IHtcblx0XHRcdHRhZzogJ3JlbW92ZScsXG5cdFx0XHR2bm9kZTogdm5vZGUsXG5cdFx0XHRpbmRleDogaW5kZXgsXG5cdFx0XHRkYXRhOiBwYXRjaFxuXHRcdH07XG5cblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyB0aGlzIGtleSB3YXMgaW5zZXJ0ZWQgZWFybGllciwgYSBtYXRjaCFcblx0aWYgKGVudHJ5LnRhZyA9PT0gJ2luc2VydCcpXG5cdHtcblx0XHRlbnRyeS50YWcgPSAnbW92ZSc7XG5cdFx0dmFyIHN1YlBhdGNoZXMgPSBbXTtcblx0XHRkaWZmSGVscCh2bm9kZSwgZW50cnkudm5vZGUsIHN1YlBhdGNoZXMsIGluZGV4KTtcblxuXHRcdHZhciBwYXRjaCA9IG1ha2VQYXRjaCgncC1yZW1vdmUnLCBpbmRleCwge1xuXHRcdFx0cGF0Y2hlczogc3ViUGF0Y2hlcyxcblx0XHRcdGVudHJ5OiBlbnRyeVxuXHRcdH0pO1xuXHRcdGxvY2FsUGF0Y2hlcy5wdXNoKHBhdGNoKTtcblxuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIHRoaXMga2V5IGhhcyBhbHJlYWR5IGJlZW4gcmVtb3ZlZCBvciBtb3ZlZCwgYSBkdXBsaWNhdGUhXG5cdHJlbW92ZU5vZGUoY2hhbmdlcywgbG9jYWxQYXRjaGVzLCBrZXkgKyBQT1NURklYLCB2bm9kZSwgaW5kZXgpO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vICBBREQgRE9NIE5PREVTICAvLy8vLy8vLy8vLy9cbi8vXG4vLyBFYWNoIERPTSBub2RlIGhhcyBhbiBcImluZGV4XCIgYXNzaWduZWQgaW4gb3JkZXIgb2YgdHJhdmVyc2FsLiBJdCBpcyBpbXBvcnRhbnRcbi8vIHRvIG1pbmltaXplIG91ciBjcmF3bCBvdmVyIHRoZSBhY3R1YWwgRE9NLCBzbyB0aGVzZSBpbmRleGVzIChhbG9uZyB3aXRoIHRoZVxuLy8gZGVzY2VuZGFudHNDb3VudCBvZiB2aXJ0dWFsIG5vZGVzKSBsZXQgdXMgc2tpcCB0b3VjaGluZyBlbnRpcmUgc3VidHJlZXMgb2Zcbi8vIHRoZSBET00gaWYgd2Uga25vdyB0aGVyZSBhcmUgbm8gcGF0Y2hlcyB0aGVyZS5cblxuXG5mdW5jdGlvbiBhZGREb21Ob2Rlcyhkb21Ob2RlLCB2Tm9kZSwgcGF0Y2hlcywgZXZlbnROb2RlKVxue1xuXHRhZGREb21Ob2Rlc0hlbHAoZG9tTm9kZSwgdk5vZGUsIHBhdGNoZXMsIDAsIDAsIHZOb2RlLmRlc2NlbmRhbnRzQ291bnQsIGV2ZW50Tm9kZSk7XG59XG5cblxuLy8gYXNzdW1lcyBgcGF0Y2hlc2AgaXMgbm9uLWVtcHR5IGFuZCBpbmRleGVzIGluY3JlYXNlIG1vbm90b25pY2FsbHkuXG5mdW5jdGlvbiBhZGREb21Ob2Rlc0hlbHAoZG9tTm9kZSwgdk5vZGUsIHBhdGNoZXMsIGksIGxvdywgaGlnaCwgZXZlbnROb2RlKVxue1xuXHR2YXIgcGF0Y2ggPSBwYXRjaGVzW2ldO1xuXHR2YXIgaW5kZXggPSBwYXRjaC5pbmRleDtcblxuXHR3aGlsZSAoaW5kZXggPT09IGxvdylcblx0e1xuXHRcdHZhciBwYXRjaFR5cGUgPSBwYXRjaC50eXBlO1xuXG5cdFx0aWYgKHBhdGNoVHlwZSA9PT0gJ3AtdGh1bmsnKVxuXHRcdHtcblx0XHRcdGFkZERvbU5vZGVzKGRvbU5vZGUsIHZOb2RlLm5vZGUsIHBhdGNoLmRhdGEsIGV2ZW50Tm9kZSk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKHBhdGNoVHlwZSA9PT0gJ3AtcmVvcmRlcicpXG5cdFx0e1xuXHRcdFx0cGF0Y2guZG9tTm9kZSA9IGRvbU5vZGU7XG5cdFx0XHRwYXRjaC5ldmVudE5vZGUgPSBldmVudE5vZGU7XG5cblx0XHRcdHZhciBzdWJQYXRjaGVzID0gcGF0Y2guZGF0YS5wYXRjaGVzO1xuXHRcdFx0aWYgKHN1YlBhdGNoZXMubGVuZ3RoID4gMClcblx0XHRcdHtcblx0XHRcdFx0YWRkRG9tTm9kZXNIZWxwKGRvbU5vZGUsIHZOb2RlLCBzdWJQYXRjaGVzLCAwLCBsb3csIGhpZ2gsIGV2ZW50Tm9kZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKHBhdGNoVHlwZSA9PT0gJ3AtcmVtb3ZlJylcblx0XHR7XG5cdFx0XHRwYXRjaC5kb21Ob2RlID0gZG9tTm9kZTtcblx0XHRcdHBhdGNoLmV2ZW50Tm9kZSA9IGV2ZW50Tm9kZTtcblxuXHRcdFx0dmFyIGRhdGEgPSBwYXRjaC5kYXRhO1xuXHRcdFx0aWYgKHR5cGVvZiBkYXRhICE9PSAndW5kZWZpbmVkJylcblx0XHRcdHtcblx0XHRcdFx0ZGF0YS5lbnRyeS5kYXRhID0gZG9tTm9kZTtcblx0XHRcdFx0dmFyIHN1YlBhdGNoZXMgPSBkYXRhLnBhdGNoZXM7XG5cdFx0XHRcdGlmIChzdWJQYXRjaGVzLmxlbmd0aCA+IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhZGREb21Ob2Rlc0hlbHAoZG9tTm9kZSwgdk5vZGUsIHN1YlBhdGNoZXMsIDAsIGxvdywgaGlnaCwgZXZlbnROb2RlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cGF0Y2guZG9tTm9kZSA9IGRvbU5vZGU7XG5cdFx0XHRwYXRjaC5ldmVudE5vZGUgPSBldmVudE5vZGU7XG5cdFx0fVxuXG5cdFx0aSsrO1xuXG5cdFx0aWYgKCEocGF0Y2ggPSBwYXRjaGVzW2ldKSB8fCAoaW5kZXggPSBwYXRjaC5pbmRleCkgPiBoaWdoKVxuXHRcdHtcblx0XHRcdHJldHVybiBpO1xuXHRcdH1cblx0fVxuXG5cdHN3aXRjaCAodk5vZGUudHlwZSlcblx0e1xuXHRcdGNhc2UgJ3RhZ2dlcic6XG5cdFx0XHR2YXIgc3ViTm9kZSA9IHZOb2RlLm5vZGU7XG5cblx0XHRcdHdoaWxlIChzdWJOb2RlLnR5cGUgPT09IFwidGFnZ2VyXCIpXG5cdFx0XHR7XG5cdFx0XHRcdHN1Yk5vZGUgPSBzdWJOb2RlLm5vZGU7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhZGREb21Ob2Rlc0hlbHAoZG9tTm9kZSwgc3ViTm9kZSwgcGF0Y2hlcywgaSwgbG93ICsgMSwgaGlnaCwgZG9tTm9kZS5lbG1fZXZlbnRfbm9kZV9yZWYpO1xuXG5cdFx0Y2FzZSAnbm9kZSc6XG5cdFx0XHR2YXIgdkNoaWxkcmVuID0gdk5vZGUuY2hpbGRyZW47XG5cdFx0XHR2YXIgY2hpbGROb2RlcyA9IGRvbU5vZGUuY2hpbGROb2Rlcztcblx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgdkNoaWxkcmVuLmxlbmd0aDsgaisrKVxuXHRcdFx0e1xuXHRcdFx0XHRsb3crKztcblx0XHRcdFx0dmFyIHZDaGlsZCA9IHZDaGlsZHJlbltqXTtcblx0XHRcdFx0dmFyIG5leHRMb3cgPSBsb3cgKyAodkNoaWxkLmRlc2NlbmRhbnRzQ291bnQgfHwgMCk7XG5cdFx0XHRcdGlmIChsb3cgPD0gaW5kZXggJiYgaW5kZXggPD0gbmV4dExvdylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGkgPSBhZGREb21Ob2Rlc0hlbHAoY2hpbGROb2Rlc1tqXSwgdkNoaWxkLCBwYXRjaGVzLCBpLCBsb3csIG5leHRMb3csIGV2ZW50Tm9kZSk7XG5cdFx0XHRcdFx0aWYgKCEocGF0Y2ggPSBwYXRjaGVzW2ldKSB8fCAoaW5kZXggPSBwYXRjaC5pbmRleCkgPiBoaWdoKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiBpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRsb3cgPSBuZXh0TG93O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGk7XG5cblx0XHRjYXNlICdrZXllZC1ub2RlJzpcblx0XHRcdHZhciB2Q2hpbGRyZW4gPSB2Tm9kZS5jaGlsZHJlbjtcblx0XHRcdHZhciBjaGlsZE5vZGVzID0gZG9tTm9kZS5jaGlsZE5vZGVzO1xuXHRcdFx0Zm9yICh2YXIgaiA9IDA7IGogPCB2Q2hpbGRyZW4ubGVuZ3RoOyBqKyspXG5cdFx0XHR7XG5cdFx0XHRcdGxvdysrO1xuXHRcdFx0XHR2YXIgdkNoaWxkID0gdkNoaWxkcmVuW2pdLl8xO1xuXHRcdFx0XHR2YXIgbmV4dExvdyA9IGxvdyArICh2Q2hpbGQuZGVzY2VuZGFudHNDb3VudCB8fCAwKTtcblx0XHRcdFx0aWYgKGxvdyA8PSBpbmRleCAmJiBpbmRleCA8PSBuZXh0TG93KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aSA9IGFkZERvbU5vZGVzSGVscChjaGlsZE5vZGVzW2pdLCB2Q2hpbGQsIHBhdGNoZXMsIGksIGxvdywgbmV4dExvdywgZXZlbnROb2RlKTtcblx0XHRcdFx0XHRpZiAoIShwYXRjaCA9IHBhdGNoZXNbaV0pIHx8IChpbmRleCA9IHBhdGNoLmluZGV4KSA+IGhpZ2gpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIGk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGxvdyA9IG5leHRMb3c7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gaTtcblxuXHRcdGNhc2UgJ3RleHQnOlxuXHRcdGNhc2UgJ3RodW5rJzpcblx0XHRcdHRocm93IG5ldyBFcnJvcignc2hvdWxkIG5ldmVyIHRyYXZlcnNlIGB0ZXh0YCBvciBgdGh1bmtgIG5vZGVzIGxpa2UgdGhpcycpO1xuXHR9XG59XG5cblxuXG4vLy8vLy8vLy8vLy8gIEFQUExZIFBBVENIRVMgIC8vLy8vLy8vLy8vL1xuXG5cbmZ1bmN0aW9uIGFwcGx5UGF0Y2hlcyhyb290RG9tTm9kZSwgb2xkVmlydHVhbE5vZGUsIHBhdGNoZXMsIGV2ZW50Tm9kZSlcbntcblx0aWYgKHBhdGNoZXMubGVuZ3RoID09PSAwKVxuXHR7XG5cdFx0cmV0dXJuIHJvb3REb21Ob2RlO1xuXHR9XG5cblx0YWRkRG9tTm9kZXMocm9vdERvbU5vZGUsIG9sZFZpcnR1YWxOb2RlLCBwYXRjaGVzLCBldmVudE5vZGUpO1xuXHRyZXR1cm4gYXBwbHlQYXRjaGVzSGVscChyb290RG9tTm9kZSwgcGF0Y2hlcyk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5UGF0Y2hlc0hlbHAocm9vdERvbU5vZGUsIHBhdGNoZXMpXG57XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgcGF0Y2hlcy5sZW5ndGg7IGkrKylcblx0e1xuXHRcdHZhciBwYXRjaCA9IHBhdGNoZXNbaV07XG5cdFx0dmFyIGxvY2FsRG9tTm9kZSA9IHBhdGNoLmRvbU5vZGVcblx0XHR2YXIgbmV3Tm9kZSA9IGFwcGx5UGF0Y2gobG9jYWxEb21Ob2RlLCBwYXRjaCk7XG5cdFx0aWYgKGxvY2FsRG9tTm9kZSA9PT0gcm9vdERvbU5vZGUpXG5cdFx0e1xuXHRcdFx0cm9vdERvbU5vZGUgPSBuZXdOb2RlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcm9vdERvbU5vZGU7XG59XG5cbmZ1bmN0aW9uIGFwcGx5UGF0Y2goZG9tTm9kZSwgcGF0Y2gpXG57XG5cdHN3aXRjaCAocGF0Y2gudHlwZSlcblx0e1xuXHRcdGNhc2UgJ3AtcmVkcmF3Jzpcblx0XHRcdHJldHVybiBhcHBseVBhdGNoUmVkcmF3KGRvbU5vZGUsIHBhdGNoLmRhdGEsIHBhdGNoLmV2ZW50Tm9kZSk7XG5cblx0XHRjYXNlICdwLWZhY3RzJzpcblx0XHRcdGFwcGx5RmFjdHMoZG9tTm9kZSwgcGF0Y2guZXZlbnROb2RlLCBwYXRjaC5kYXRhKTtcblx0XHRcdHJldHVybiBkb21Ob2RlO1xuXG5cdFx0Y2FzZSAncC10ZXh0Jzpcblx0XHRcdGRvbU5vZGUucmVwbGFjZURhdGEoMCwgZG9tTm9kZS5sZW5ndGgsIHBhdGNoLmRhdGEpO1xuXHRcdFx0cmV0dXJuIGRvbU5vZGU7XG5cblx0XHRjYXNlICdwLXRodW5rJzpcblx0XHRcdHJldHVybiBhcHBseVBhdGNoZXNIZWxwKGRvbU5vZGUsIHBhdGNoLmRhdGEpO1xuXG5cdFx0Y2FzZSAncC10YWdnZXInOlxuXHRcdFx0ZG9tTm9kZS5lbG1fZXZlbnRfbm9kZV9yZWYudGFnZ2VyID0gcGF0Y2guZGF0YTtcblx0XHRcdHJldHVybiBkb21Ob2RlO1xuXG5cdFx0Y2FzZSAncC1yZW1vdmUtbGFzdCc6XG5cdFx0XHR2YXIgaSA9IHBhdGNoLmRhdGE7XG5cdFx0XHR3aGlsZSAoaS0tKVxuXHRcdFx0e1xuXHRcdFx0XHRkb21Ob2RlLnJlbW92ZUNoaWxkKGRvbU5vZGUubGFzdENoaWxkKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBkb21Ob2RlO1xuXG5cdFx0Y2FzZSAncC1hcHBlbmQnOlxuXHRcdFx0dmFyIG5ld05vZGVzID0gcGF0Y2guZGF0YTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbmV3Tm9kZXMubGVuZ3RoOyBpKyspXG5cdFx0XHR7XG5cdFx0XHRcdGRvbU5vZGUuYXBwZW5kQ2hpbGQocmVuZGVyKG5ld05vZGVzW2ldLCBwYXRjaC5ldmVudE5vZGUpKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBkb21Ob2RlO1xuXG5cdFx0Y2FzZSAncC1yZW1vdmUnOlxuXHRcdFx0dmFyIGRhdGEgPSBwYXRjaC5kYXRhO1xuXHRcdFx0aWYgKHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJylcblx0XHRcdHtcblx0XHRcdFx0ZG9tTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRvbU5vZGUpO1xuXHRcdFx0XHRyZXR1cm4gZG9tTm9kZTtcblx0XHRcdH1cblx0XHRcdHZhciBlbnRyeSA9IGRhdGEuZW50cnk7XG5cdFx0XHRpZiAodHlwZW9mIGVudHJ5LmluZGV4ICE9PSAndW5kZWZpbmVkJylcblx0XHRcdHtcblx0XHRcdFx0ZG9tTm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRvbU5vZGUpO1xuXHRcdFx0fVxuXHRcdFx0ZW50cnkuZGF0YSA9IGFwcGx5UGF0Y2hlc0hlbHAoZG9tTm9kZSwgZGF0YS5wYXRjaGVzKTtcblx0XHRcdHJldHVybiBkb21Ob2RlO1xuXG5cdFx0Y2FzZSAncC1yZW9yZGVyJzpcblx0XHRcdHJldHVybiBhcHBseVBhdGNoUmVvcmRlcihkb21Ob2RlLCBwYXRjaCk7XG5cblx0XHRjYXNlICdwLWN1c3RvbSc6XG5cdFx0XHR2YXIgaW1wbCA9IHBhdGNoLmRhdGE7XG5cdFx0XHRyZXR1cm4gaW1wbC5hcHBseVBhdGNoKGRvbU5vZGUsIGltcGwuZGF0YSk7XG5cblx0XHRkZWZhdWx0OlxuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdSYW4gaW50byBhbiB1bmtub3duIHBhdGNoIScpO1xuXHR9XG59XG5cblxuZnVuY3Rpb24gYXBwbHlQYXRjaFJlZHJhdyhkb21Ob2RlLCB2Tm9kZSwgZXZlbnROb2RlKVxue1xuXHR2YXIgcGFyZW50Tm9kZSA9IGRvbU5vZGUucGFyZW50Tm9kZTtcblx0dmFyIG5ld05vZGUgPSByZW5kZXIodk5vZGUsIGV2ZW50Tm9kZSk7XG5cblx0aWYgKHR5cGVvZiBuZXdOb2RlLmVsbV9ldmVudF9ub2RlX3JlZiA9PT0gJ3VuZGVmaW5lZCcpXG5cdHtcblx0XHRuZXdOb2RlLmVsbV9ldmVudF9ub2RlX3JlZiA9IGRvbU5vZGUuZWxtX2V2ZW50X25vZGVfcmVmO1xuXHR9XG5cblx0aWYgKHBhcmVudE5vZGUgJiYgbmV3Tm9kZSAhPT0gZG9tTm9kZSlcblx0e1xuXHRcdHBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5ld05vZGUsIGRvbU5vZGUpO1xuXHR9XG5cdHJldHVybiBuZXdOb2RlO1xufVxuXG5cbmZ1bmN0aW9uIGFwcGx5UGF0Y2hSZW9yZGVyKGRvbU5vZGUsIHBhdGNoKVxue1xuXHR2YXIgZGF0YSA9IHBhdGNoLmRhdGE7XG5cblx0Ly8gcmVtb3ZlIGVuZCBpbnNlcnRzXG5cdHZhciBmcmFnID0gYXBwbHlQYXRjaFJlb3JkZXJFbmRJbnNlcnRzSGVscChkYXRhLmVuZEluc2VydHMsIHBhdGNoKTtcblxuXHQvLyByZW1vdmFsc1xuXHRkb21Ob2RlID0gYXBwbHlQYXRjaGVzSGVscChkb21Ob2RlLCBkYXRhLnBhdGNoZXMpO1xuXG5cdC8vIGluc2VydHNcblx0dmFyIGluc2VydHMgPSBkYXRhLmluc2VydHM7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgaW5zZXJ0cy5sZW5ndGg7IGkrKylcblx0e1xuXHRcdHZhciBpbnNlcnQgPSBpbnNlcnRzW2ldO1xuXHRcdHZhciBlbnRyeSA9IGluc2VydC5lbnRyeTtcblx0XHR2YXIgbm9kZSA9IGVudHJ5LnRhZyA9PT0gJ21vdmUnXG5cdFx0XHQ/IGVudHJ5LmRhdGFcblx0XHRcdDogcmVuZGVyKGVudHJ5LnZub2RlLCBwYXRjaC5ldmVudE5vZGUpO1xuXHRcdGRvbU5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIGRvbU5vZGUuY2hpbGROb2Rlc1tpbnNlcnQuaW5kZXhdKTtcblx0fVxuXG5cdC8vIGFkZCBlbmQgaW5zZXJ0c1xuXHRpZiAodHlwZW9mIGZyYWcgIT09ICd1bmRlZmluZWQnKVxuXHR7XG5cdFx0ZG9tTm9kZS5hcHBlbmRDaGlsZChmcmFnKTtcblx0fVxuXG5cdHJldHVybiBkb21Ob2RlO1xufVxuXG5cbmZ1bmN0aW9uIGFwcGx5UGF0Y2hSZW9yZGVyRW5kSW5zZXJ0c0hlbHAoZW5kSW5zZXJ0cywgcGF0Y2gpXG57XG5cdGlmICh0eXBlb2YgZW5kSW5zZXJ0cyA9PT0gJ3VuZGVmaW5lZCcpXG5cdHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBlbmRJbnNlcnRzLmxlbmd0aDsgaSsrKVxuXHR7XG5cdFx0dmFyIGluc2VydCA9IGVuZEluc2VydHNbaV07XG5cdFx0dmFyIGVudHJ5ID0gaW5zZXJ0LmVudHJ5O1xuXHRcdGZyYWcuYXBwZW5kQ2hpbGQoZW50cnkudGFnID09PSAnbW92ZSdcblx0XHRcdD8gZW50cnkuZGF0YVxuXHRcdFx0OiByZW5kZXIoZW50cnkudm5vZGUsIHBhdGNoLmV2ZW50Tm9kZSlcblx0XHQpO1xuXHR9XG5cdHJldHVybiBmcmFnO1xufVxuXG5cblxuLy8vLy8vLy8vLy8vICBQUk9HUkFNUyAgLy8vLy8vLy8vLy8vXG5cblxuZnVuY3Rpb24gcHJvZ3JhbVdpdGhGbGFncyhkZXRhaWxzKVxue1xuXHRyZXR1cm4ge1xuXHRcdGluaXQ6IGRldGFpbHMuaW5pdCxcblx0XHR1cGRhdGU6IGRldGFpbHMudXBkYXRlLFxuXHRcdHN1YnNjcmlwdGlvbnM6IGRldGFpbHMuc3Vic2NyaXB0aW9ucyxcblx0XHR2aWV3OiBkZXRhaWxzLnZpZXcsXG5cdFx0cmVuZGVyZXI6IHJlbmRlcmVyXG5cdH07XG59XG5cblxucmV0dXJuIHtcblx0bm9kZTogbm9kZSxcblx0dGV4dDogdGV4dCxcblxuXHRjdXN0b206IGN1c3RvbSxcblxuXHRtYXA6IEYyKG1hcCksXG5cblx0b246IEYzKG9uKSxcblx0c3R5bGU6IHN0eWxlLFxuXHRwcm9wZXJ0eTogRjIocHJvcGVydHkpLFxuXHRhdHRyaWJ1dGU6IEYyKGF0dHJpYnV0ZSksXG5cdGF0dHJpYnV0ZU5TOiBGMyhhdHRyaWJ1dGVOUyksXG5cblx0bGF6eTogRjIobGF6eSksXG5cdGxhenkyOiBGMyhsYXp5MiksXG5cdGxhenkzOiBGNChsYXp5MyksXG5cdGtleWVkTm9kZTogRjMoa2V5ZWROb2RlKSxcblxuXHRwcm9ncmFtV2l0aEZsYWdzOiBwcm9ncmFtV2l0aEZsYWdzXG59O1xuXG59KCk7XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kcHJvZ3JhbVdpdGhGbGFncyA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSROYXRpdmVfVmlydHVhbERvbS5wcm9ncmFtV2l0aEZsYWdzO1xudmFyIF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJGtleWVkTm9kZSA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSROYXRpdmVfVmlydHVhbERvbS5rZXllZE5vZGU7XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kbGF6eTMgPSBfZWxtX2xhbmckdmlydHVhbF9kb20kTmF0aXZlX1ZpcnR1YWxEb20ubGF6eTM7XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kbGF6eTIgPSBfZWxtX2xhbmckdmlydHVhbF9kb20kTmF0aXZlX1ZpcnR1YWxEb20ubGF6eTI7XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kbGF6eSA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSROYXRpdmVfVmlydHVhbERvbS5sYXp5O1xudmFyIF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJGRlZmF1bHRPcHRpb25zID0ge3N0b3BQcm9wYWdhdGlvbjogZmFsc2UsIHByZXZlbnREZWZhdWx0OiBmYWxzZX07XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kb25XaXRoT3B0aW9ucyA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSROYXRpdmVfVmlydHVhbERvbS5vbjtcbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRvbiA9IEYyKFxuXHRmdW5jdGlvbiAoZXZlbnROYW1lLCBkZWNvZGVyKSB7XG5cdFx0cmV0dXJuIEEzKF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJG9uV2l0aE9wdGlvbnMsIGV2ZW50TmFtZSwgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kZGVmYXVsdE9wdGlvbnMsIGRlY29kZXIpO1xuXHR9KTtcbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRzdHlsZSA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSROYXRpdmVfVmlydHVhbERvbS5zdHlsZTtcbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRhdHRyaWJ1dGVOUyA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSROYXRpdmVfVmlydHVhbERvbS5hdHRyaWJ1dGVOUztcbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRhdHRyaWJ1dGUgPSBfZWxtX2xhbmckdmlydHVhbF9kb20kTmF0aXZlX1ZpcnR1YWxEb20uYXR0cmlidXRlO1xudmFyIF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJHByb3BlcnR5ID0gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJE5hdGl2ZV9WaXJ0dWFsRG9tLnByb3BlcnR5O1xudmFyIF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJG1hcCA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSROYXRpdmVfVmlydHVhbERvbS5tYXA7XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kdGV4dCA9IF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSROYXRpdmVfVmlydHVhbERvbS50ZXh0O1xudmFyIF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJG5vZGUgPSBfZWxtX2xhbmckdmlydHVhbF9kb20kTmF0aXZlX1ZpcnR1YWxEb20ubm9kZTtcbnZhciBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRPcHRpb25zID0gRjIoXG5cdGZ1bmN0aW9uIChhLCBiKSB7XG5cdFx0cmV0dXJuIHtzdG9wUHJvcGFnYXRpb246IGEsIHByZXZlbnREZWZhdWx0OiBifTtcblx0fSk7XG52YXIgX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kTm9kZSA9IHtjdG9yOiAnTm9kZSd9O1xudmFyIF9lbG1fbGFuZyR2aXJ0dWFsX2RvbSRWaXJ0dWFsRG9tJFByb3BlcnR5ID0ge2N0b3I6ICdQcm9wZXJ0eSd9O1xuXG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR0ZXh0ID0gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kdGV4dDtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUgPSBfZWxtX2xhbmckdmlydHVhbF9kb20kVmlydHVhbERvbSRub2RlO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkYm9keSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnYm9keScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkc2VjdGlvbiA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnc2VjdGlvbicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkbmF2ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCduYXYnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGFydGljbGUgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2FydGljbGUnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGFzaWRlID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdhc2lkZScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkaDEgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2gxJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRoMiA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnaDInKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGgzID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdoMycpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkaDQgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2g0Jyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRoNSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnaDUnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGg2ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdoNicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkaGVhZGVyID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdoZWFkZXInKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGZvb3RlciA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnZm9vdGVyJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRhZGRyZXNzID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdhZGRyZXNzJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRtYWluJCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnbWFpbicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkcCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgncCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkaHIgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2hyJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRwcmUgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3ByZScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkYmxvY2txdW90ZSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnYmxvY2txdW90ZScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkb2wgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ29sJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR1bCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgndWwnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGxpID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdsaScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkZGwgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2RsJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRkdCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnZHQnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGRkID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdkZCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkZmlndXJlID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdmaWd1cmUnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGZpZ2NhcHRpb24gPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2ZpZ2NhcHRpb24nKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGRpdiA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnZGl2Jyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRhID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdhJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRlbSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnZW0nKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHN0cm9uZyA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnc3Ryb25nJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRzbWFsbCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnc21hbGwnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHMgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3MnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGNpdGUgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2NpdGUnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHEgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3EnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGRmbiA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnZGZuJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRhYmJyID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdhYmJyJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR0aW1lID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCd0aW1lJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRjb2RlID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdjb2RlJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR2YXIgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3ZhcicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkc2FtcCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnc2FtcCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwka2JkID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdrYmQnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHN1YiA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnc3ViJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRzdXAgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3N1cCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkaSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnaScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkYiA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnYicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkdSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgndScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkbWFyayA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnbWFyaycpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkcnVieSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgncnVieScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkcnQgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3J0Jyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRycCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgncnAnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGJkaSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnYmRpJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRiZG8gPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2JkbycpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkc3BhbiA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnc3BhbicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkYnIgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2JyJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR3YnIgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3dicicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkaW5zID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdpbnMnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGRlbCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnZGVsJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRpbWcgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ2ltZycpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkaWZyYW1lID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdpZnJhbWUnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGVtYmVkID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdlbWJlZCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkb2JqZWN0ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdvYmplY3QnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHBhcmFtID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdwYXJhbScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkdmlkZW8gPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3ZpZGVvJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRhdWRpbyA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnYXVkaW8nKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHNvdXJjZSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnc291cmNlJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR0cmFjayA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgndHJhY2snKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGNhbnZhcyA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnY2FudmFzJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRzdmcgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3N2ZycpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkbWF0aCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnbWF0aCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkdGFibGUgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3RhYmxlJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRjYXB0aW9uID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdjYXB0aW9uJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRjb2xncm91cCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnY29sZ3JvdXAnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGNvbCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnY29sJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR0Ym9keSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgndGJvZHknKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHRoZWFkID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCd0aGVhZCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkdGZvb3QgPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3Rmb290Jyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCR0ciA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgndHInKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHRkID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCd0ZCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkdGggPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ3RoJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRmb3JtID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdmb3JtJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRmaWVsZHNldCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnZmllbGRzZXQnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGxlZ2VuZCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnbGVnZW5kJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRsYWJlbCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnbGFiZWwnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJGlucHV0ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdpbnB1dCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkYnV0dG9uID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdidXR0b24nKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHNlbGVjdCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnc2VsZWN0Jyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRkYXRhbGlzdCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnZGF0YWxpc3QnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJG9wdGdyb3VwID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdvcHRncm91cCcpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkb3B0aW9uID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdvcHRpb24nKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJHRleHRhcmVhID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCd0ZXh0YXJlYScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwka2V5Z2VuID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdrZXlnZW4nKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJG91dHB1dCA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnb3V0cHV0Jyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRwcm9ncmVzcyA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgncHJvZ3Jlc3MnKTtcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sJG1ldGVyID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdtZXRlcicpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkZGV0YWlscyA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnZGV0YWlscycpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkc3VtbWFyeSA9IF9lbG1fbGFuZyRodG1sJEh0bWwkbm9kZSgnc3VtbWFyeScpO1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWwkbWVudWl0ZW0gPSBfZWxtX2xhbmckaHRtbCRIdG1sJG5vZGUoJ21lbnVpdGVtJyk7XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbCRtZW51ID0gX2VsbV9sYW5nJGh0bWwkSHRtbCRub2RlKCdtZW51Jyk7XG5cbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sX0FwcCRwcm9ncmFtV2l0aEZsYWdzID0gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kcHJvZ3JhbVdpdGhGbGFncztcbnZhciBfZWxtX2xhbmckaHRtbCRIdG1sX0FwcCRwcm9ncmFtID0gZnVuY3Rpb24gKGFwcCkge1xuXHRyZXR1cm4gX2VsbV9sYW5nJGh0bWwkSHRtbF9BcHAkcHJvZ3JhbVdpdGhGbGFncyhcblx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMudXBkYXRlKFxuXHRcdFx0YXBwLFxuXHRcdFx0e1xuXHRcdFx0XHRpbml0OiBmdW5jdGlvbiAoX3AwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFwcC5pbml0O1xuXHRcdFx0XHR9XG5cdFx0XHR9KSk7XG59O1xudmFyIF9lbG1fbGFuZyRodG1sJEh0bWxfQXBwJGJlZ2lubmVyUHJvZ3JhbSA9IGZ1bmN0aW9uIChfcDEpIHtcblx0dmFyIF9wMiA9IF9wMTtcblx0cmV0dXJuIF9lbG1fbGFuZyRodG1sJEh0bWxfQXBwJHByb2dyYW1XaXRoRmxhZ3MoXG5cdFx0e1xuXHRcdFx0aW5pdDogZnVuY3Rpb24gKF9wMykge1xuXHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fQ21kX29wc1snISddLFxuXHRcdFx0XHRcdF9wMi5tb2RlbCxcblx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0XHRbXSkpO1xuXHRcdFx0fSxcblx0XHRcdHVwZGF0ZTogRjIoXG5cdFx0XHRcdGZ1bmN0aW9uIChtc2csIG1vZGVsKSB7XG5cdFx0XHRcdFx0cmV0dXJuIEEyKFxuXHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fQ21kX29wc1snISddLFxuXHRcdFx0XHRcdFx0QTIoX3AyLnVwZGF0ZSwgbXNnLCBtb2RlbCksXG5cdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0XHRcdFtdKSk7XG5cdFx0XHRcdH0pLFxuXHRcdFx0dmlldzogX3AyLnZpZXcsXG5cdFx0XHRzdWJzY3JpcHRpb25zOiBmdW5jdGlvbiAoX3A0KSB7XG5cdFx0XHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9TdWIkbm9uZTtcblx0XHRcdH1cblx0XHR9KTtcbn07XG52YXIgX2VsbV9sYW5nJGh0bWwkSHRtbF9BcHAkbWFwID0gX2VsbV9sYW5nJHZpcnR1YWxfZG9tJFZpcnR1YWxEb20kbWFwO1xuXG4vKiBnbG9iYWxzIEVsbSAqL1xuLyogZXNsaW50LWRpc2FibGUgbmV3LWNhcCwgbm8tdW5kZXJzY29yZS1kYW5nbGUgKi9cblxuLyoqXG4gKiBJZiBpdCdzIG5vdCBhIE1heWJlLCByZXR1cm5zIHdoYXRldmVyIHZhbHVlIHRoYXQgaXMsIGlmIGl0IGlzXG4gKiBhIE1heWJlLCByZXR1cm5zIGB2YWx1ZWAgZm9yIGBKdXN0IHZhbHVlYCBhbmQgYG51bGxgIGZvciBgTm90aGluZ2BcbiAqIEBtZXRob2QgZnJvbU1heWJlXG4gKiBAcGFyYW0gIHtPYmplY3Q8QW55PiB8IEFueSB9IHZhbFxuICogQHJldHVybiB7QW55fVxuICovXG5jb25zdCBmcm9tTWF5YmUgPSB2YWwgPT4ge1xuICBjb25zdCBpc01heWJlID0gdmFsICYmIHZhbC5jdG9yO1xuXG4gIGlmICghaXNNYXliZSkge1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICByZXR1cm4gdmFsLl8wID8gdmFsLl8wIDogbnVsbDtcbn07XG5cbmNvbnN0IHBhcnNlRWxtTGlzdCA9IGwgPT4ge1xuICBpZiAoQXJyYXkuaXNBcnJheShsKSkge1xuICAgIHJldHVybiBsO1xuICB9XG5cbiAgbGV0IGxpc3QgPSBbXVxuICBsZXQgY291bnRlciA9IDBcbiAgbGV0IGtleSA9IGBfJHtjb3VudGVyfWA7XG4gIHdoaWxlIChsW2tleV0gIT09IHVuZGVmaW5lZCAmJiBsW2tleV0uY3RvciAhPT0gJ1tdJykge1xuICAgIGxpc3QgPSBsaXN0LmNvbmNhdChsW2tleV0pO1xuICAgIGNvdW50ZXIgPSBjb3VudGVyICsgMVxuICAgIGtleSA9IGBfJHtjb3VudGVyfWA7XG4gIH1cblxuICByZXR1cm4gbGlzdDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIEVsbSBhY2NlcHRhYmxlIE1vZGFsIG9iamVjdFxuICogQG1ldGhvZCBNb2RhbFxuICogQHBhcmFtICB7U3RyaW5nfSBzZWxlY3RvclxuICogQHBhcmFtICB7U3RyaW5nIHwgTWF5YmUgU3RyaW5nfSB0YXJnZXRVcmxcbiAqL1xuY29uc3QgTW9kYWwgPSBmdW5jdGlvbiAoeyBzZWxlY3RvciwgdGFyZ2V0VXJsIH0gPSB7fSkge1xuICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgLy8gSXQgd2FzIG5vdCBzZXQgYnkgRWxtXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCB1cmwgPSBmcm9tTWF5YmUodGFyZ2V0VXJsKTtcbiAgcmV0dXJuIHsgc2VsZWN0b3IsIHRhcmdldFVybDogdXJsIH07XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gRWxtIGFjY2VwdGFibGUgSGlzdG9yeVN0YXRlIG9iamVjdFxuICogVGhpcyBpcyB1c2VkIHRvIG1ha2UgdGhlIGxpbmsgRWxtLUpTIGFuZCBKUy1FbG1cbiAqIEBtZXRob2QgSGlzdG9yeVN0YXRlXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHVybFxuICogQHBhcmFtICB7QXJyYXk8TW9kYWw+fVxuICovXG5jb25zdCBIaXN0b3J5U3RhdGUgPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgY29uc3QgeyB1cmwsIG9wZW5Nb2RhbHMsIHNlc3Npb25JZCB9ID0gc3RhdGUgfHwge307XG4gIGlmICghdXJsKSB7XG4gICAgLy8gSXQgd2FzIG5vdCBzZXQgYnkgRWxtXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBjb25zdCBtb2RhbHMgPSBwYXJzZUVsbUxpc3Qob3Blbk1vZGFscykubWFwKE1vZGFsKTtcbiAgbW9kYWxzLmZvckVhY2gobSA9PiB7XG4gICAgaWYgKCFtKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdBIG51bGwgbW9kYWwgd2FzIGZvdW5kIGluIGEgaGlzdG9yeSBzdGF0ZS4gJ1xuICAgICAgICArIGBTb21ldGhpbmcgaXMgd3JvbmcuIEhlcmUgYXJlIGFsbCB0aGUgbW9kYWxzICR7SlNPTi5zdHJpbmdpZnkobW9kYWxzKX1gXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB7IHVybCwgc2Vzc2lvbklkLCBvcGVuTW9kYWxzOiBtb2RhbHMgfTtcbn07XG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PSBFTE0gTkFUSVZFID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuXG5jb25zdCBfdXNlciRwcm9qZWN0JE5hdGl2ZV9IaXN0b3J5ID0ge1xuICBwdXNoU3RhdGU6IChzdGF0ZSkgPT4ge1xuICAgIGNvbnN0IGhpc3RTdGF0ZSA9IEhpc3RvcnlTdGF0ZShzdGF0ZSk7XG4gICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKGhpc3RTdGF0ZSwgJ21vZGFsLXJvdXRlci1zdGF0ZScsIGhpc3RTdGF0ZS51cmwpXG4gIH0sXG4gIHJlcGxhY2VTdGF0ZTogKHN0YXRlKSA9PiB7XG4gICAgY29uc3QgaGlzdFN0YXRlID0gSGlzdG9yeVN0YXRlKHN0YXRlKTtcbiAgICB3aW5kb3cuaGlzdG9yeS5yZXBsYWNlU3RhdGUoaGlzdFN0YXRlLCAnbW9kYWwtcm91dGVyLXN0YXRlJywgaGlzdFN0YXRlLnVybClcbiAgfSxcbiAgZ2V0U3RhdGU6ICgpID0+IEhpc3RvcnlTdGF0ZSh3aW5kb3cuaGlzdG9yeS5zdGF0ZSksXG59O1xuXG4vKiBnbG9iYWwgJCovXG52YXIgX3VzZXIkcHJvamVjdCROYXRpdmVfTW9kYWwgPSB7XG4gIG9wZW46IChzZWxlY3RvcikgPT4ge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgICQoc2VsZWN0b3IpLm1vZGFsKCdzaG93Jyk7XG4gIH0sXG4gIGNsb3NlOiAoc2VsZWN0b3IpID0+IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAkKHNlbGVjdG9yKS5tb2RhbCgnaGlkZScpO1xuICB9LFxuICBnZXRPcGVuOiAoKSA9PiB7XG4gICAgcmV0dXJuIFsnbXlJZCddOyAvLyBUT0RPOiBpbXBsZW1lbnQgdGhpc1xuICB9LFxufTtcblxudmFyIF91c2VyJHByb2plY3QkTW9kYWwkZ2V0T3BlbiA9IGZ1bmN0aW9uIChhKSB7XG5cdHJldHVybiBfdXNlciRwcm9qZWN0JE5hdGl2ZV9Nb2RhbC5nZXRPcGVuKFxuXHRcdHtjdG9yOiAnX1R1cGxlMCd9KTtcbn07XG52YXIgX3VzZXIkcHJvamVjdCRNb2RhbCRjbG9zZSA9IGZ1bmN0aW9uIChtb2RhbCkge1xuXHRyZXR1cm4gQTIoXG5cdFx0X2VsbV9sYW5nJGNvcmUkQmFzaWNzJGFsd2F5cyxcblx0XHRfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWQkbm9uZSxcblx0XHRfdXNlciRwcm9qZWN0JE5hdGl2ZV9Nb2RhbC5jbG9zZShtb2RhbC5zZWxlY3RvcikpO1xufTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsJG9wZW4gPSBmdW5jdGlvbiAobW9kYWwpIHtcblx0cmV0dXJuIEEyKFxuXHRcdF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRhbHdheXMsXG5cdFx0X2VsbV9sYW5nJGNvcmUkUGxhdGZvcm1fQ21kJG5vbmUsXG5cdFx0X3VzZXIkcHJvamVjdCROYXRpdmVfTW9kYWwub3Blbihtb2RhbC5zZWxlY3RvcikpO1xufTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsJE1vZGFsID0gRjIoXG5cdGZ1bmN0aW9uIChhLCBiKSB7XG5cdFx0cmV0dXJuIHtzZWxlY3RvcjogYSwgdGFyZ2V0VXJsOiBifTtcblx0fSk7XG5cbnZhciBfdXNlciRwcm9qZWN0JE5hdGl2ZV9VcmkgPSB7XG4gIGVuY29kZVVyaTogZW5jb2RlVVJJLFxuICBlbmNvZGVVcmlDb21wb25lbnQ6IGVuY29kZVVSSUNvbXBvbmVudCxcbiAgZ2V0Q3VycmVudDogKCkgPT4gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLFxufTtcblxudmFyIF91c2VyJHByb2plY3QkVXJpJGdldEN1cnJlbnQgPSBmdW5jdGlvbiAoYSkge1xuXHRyZXR1cm4gX3VzZXIkcHJvamVjdCROYXRpdmVfVXJpLmdldEN1cnJlbnQoXG5cdFx0e2N0b3I6ICdfVHVwbGUwJ30pO1xufTtcbnZhciBfdXNlciRwcm9qZWN0JFVyaSRlbmNvZGVVcmlDb21wb25lbnQgPSBmdW5jdGlvbiAoc3RyKSB7XG5cdHJldHVybiBfdXNlciRwcm9qZWN0JE5hdGl2ZV9VcmkuZW5jb2RlVXJpQ29tcG9uZW50KHN0cik7XG59O1xudmFyIF91c2VyJHByb2plY3QkVXJpJGVuY29kZVVyaSA9IGZ1bmN0aW9uIChzdHIpIHtcblx0cmV0dXJuIF91c2VyJHByb2plY3QkTmF0aXZlX1VyaS5lbmNvZGVVcmkoc3RyKTtcbn07XG5cbnZhciBfdXNlciRwcm9qZWN0JEhpc3RvcnkkZ2V0U3RhdGUgPSBmdW5jdGlvbiAoYSkge1xuXHRyZXR1cm4gX3VzZXIkcHJvamVjdCROYXRpdmVfSGlzdG9yeS5nZXRTdGF0ZShhKTtcbn07XG52YXIgX3VzZXIkcHJvamVjdCRIaXN0b3J5JHJlcGxhY2VTdGF0ZSA9IGZ1bmN0aW9uIChoaXN0KSB7XG5cdHJldHVybiBBMihcblx0XHRfZWxtX2xhbmckY29yZSRCYXNpY3MkYWx3YXlzLFxuXHRcdF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZCRub25lLFxuXHRcdF91c2VyJHByb2plY3QkTmF0aXZlX0hpc3RvcnkucmVwbGFjZVN0YXRlKGhpc3QpKTtcbn07XG52YXIgX3VzZXIkcHJvamVjdCRIaXN0b3J5JHB1c2hTdGF0ZSA9IGZ1bmN0aW9uIChoaXN0KSB7XG5cdHJldHVybiBBMihcblx0XHRfZWxtX2xhbmckY29yZSRCYXNpY3MkYWx3YXlzLFxuXHRcdF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZCRub25lLFxuXHRcdF91c2VyJHByb2plY3QkTmF0aXZlX0hpc3RvcnkucHVzaFN0YXRlKFxuXHRcdFx0QTIoX2VsbV9sYW5nJGNvcmUkRGVidWckbG9nLCAnUHVzaGluZyBoaXN0b3J5OiAnLCBoaXN0KSkpO1xufTtcbnZhciBfdXNlciRwcm9qZWN0JEhpc3RvcnkkSGlzdG9yeVN0YXRlID0gRjMoXG5cdGZ1bmN0aW9uIChhLCBiLCBjKSB7XG5cdFx0cmV0dXJuIHtvcGVuTW9kYWxzOiBhLCB1cmw6IGIsIHNlc3Npb25JZDogY307XG5cdH0pO1xuXG52YXIgX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9UeXBlcyRNb2RlbCA9IEYzKFxuXHRmdW5jdGlvbiAoYSwgYiwgYykge1xuXHRcdHJldHVybiB7b3Blbk1vZGFsczogYSwgaW5pdGlhbFVybDogYiwgc2Vzc2lvbklkOiBjfTtcblx0fSk7XG52YXIgX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9UeXBlcyRNb2RhbENsb3NlID0gZnVuY3Rpb24gKGEpIHtcblx0cmV0dXJuIHtjdG9yOiAnTW9kYWxDbG9zZScsIF8wOiBhfTtcbn07XG52YXIgX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9UeXBlcyRNb2RhbE9wZW4gPSBmdW5jdGlvbiAoYSkge1xuXHRyZXR1cm4ge2N0b3I6ICdNb2RhbE9wZW4nLCBfMDogYX07XG59O1xudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfVHlwZXMkUG9wU3RhdGUgPSBmdW5jdGlvbiAoYSkge1xuXHRyZXR1cm4ge2N0b3I6ICdQb3BTdGF0ZScsIF8wOiBhfTtcbn07XG5cbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJHRvSGlzdG9yeVN0YXRlID0gZnVuY3Rpb24gKF9wMCkge1xuXHR2YXIgX3AxID0gX3AwO1xuXHR2YXIgX3AyID0gX3AxLm9wZW5Nb2RhbHM7XG5cdHZhciBzdGF0ZVVybCA9IEEyKFxuXHRcdF9lbG1fbGFuZyRjb3JlJE1heWJlJHdpdGhEZWZhdWx0LFxuXHRcdF9wMS5pbml0aWFsVXJsLFxuXHRcdEEzKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkQmFzaWNzJGZsaXAsXG5cdFx0XHRfZWxtX2xhbmckY29yZSRNYXliZSRhbmRUaGVuLFxuXHRcdFx0ZnVuY3Rpb24gKHgpIHtcblx0XHRcdFx0cmV0dXJuIHgudGFyZ2V0VXJsO1xuXHRcdFx0fSxcblx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkaGVhZChfcDIpKSk7XG5cdHJldHVybiBBMyhfdXNlciRwcm9qZWN0JEhpc3RvcnkkSGlzdG9yeVN0YXRlLCBfcDIsIHN0YXRlVXJsLCBfcDEuc2Vzc2lvbklkKTtcbn07XG52YXIgX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRwdXNoU3RhdGUgPSBmdW5jdGlvbiAobW9kZWwpIHtcblx0cmV0dXJuIF91c2VyJHByb2plY3QkSGlzdG9yeSRwdXNoU3RhdGUoXG5cdFx0X3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSR0b0hpc3RvcnlTdGF0ZShtb2RlbCkpO1xufTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJHJlcGxhY2VTdGF0ZSA9IGZ1bmN0aW9uIChtb2RlbCkge1xuXHRyZXR1cm4gX3VzZXIkcHJvamVjdCRIaXN0b3J5JHJlcGxhY2VTdGF0ZShcblx0XHRfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJHRvSGlzdG9yeVN0YXRlKG1vZGVsKSk7XG59O1xudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkbWlzc2luZ0luID0gRjIoXG5cdGZ1bmN0aW9uIChhLCBiKSB7XG5cdFx0cmV0dXJuIEEyKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRmaWx0ZXIsXG5cdFx0XHRmdW5jdGlvbiAoeCkge1xuXHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkQmFzaWNzJG5vdChcblx0XHRcdFx0XHRBMihfZWxtX2xhbmckY29yZSRMaXN0JG1lbWJlciwgeCwgYikpO1xuXHRcdFx0fSxcblx0XHRcdGEpO1xuXHR9KTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJGNvbmZvcm1XaW5kb3dUb1N0YXRlID0gRjIoXG5cdGZ1bmN0aW9uIChzdGF0ZSwgbW9kZWwpIHtcblx0XHR2YXIgbW9kYWxzVG9DbG9zZSA9IEEyKF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkbWlzc2luZ0luLCBtb2RlbC5vcGVuTW9kYWxzLCBzdGF0ZS5vcGVuTW9kYWxzKTtcblx0XHR2YXIgbW9kYWxzVG9PcGVuID0gQTIoX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRtaXNzaW5nSW4sIHN0YXRlLm9wZW5Nb2RhbHMsIG1vZGVsLm9wZW5Nb2RhbHMpO1xuXHRcdHJldHVybiBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWQkYmF0Y2goXG5cdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0JGNvbmNhdChcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJExpc3QkbWFwLCBfdXNlciRwcm9qZWN0JE1vZGFsJG9wZW4sIG1vZGFsc1RvT3BlbiksXG5cdFx0XHRcdFx0XHRBMihfZWxtX2xhbmckY29yZSRMaXN0JG1hcCwgX3VzZXIkcHJvamVjdCRNb2RhbCRjbG9zZSwgbW9kYWxzVG9DbG9zZSksXG5cdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0XHRbXG5cdFx0XHRcdFx0XHRcdF91c2VyJHByb2plY3QkSGlzdG9yeSRyZXBsYWNlU3RhdGUoc3RhdGUpXG5cdFx0XHRcdFx0XHRdKVxuXHRcdFx0XHRcdF0pKSk7XG5cdH0pO1xudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkaXNNb2RhbE9wZW4gPSBGMihcblx0ZnVuY3Rpb24gKG9wZW5Nb2RhbHMsIHNlbGVjdG9yKSB7XG5cdFx0cmV0dXJuIEEyKFxuXHRcdFx0X2VsbV9sYW5nJGNvcmUkTGlzdCRtZW1iZXIsXG5cdFx0XHRzZWxlY3Rvcixcblx0XHRcdEEyKFxuXHRcdFx0XHRfZWxtX2xhbmckY29yZSRMaXN0JG1hcCxcblx0XHRcdFx0ZnVuY3Rpb24gKG0pIHtcblx0XHRcdFx0XHRyZXR1cm4gbS5zZWxlY3Rvcjtcblx0XHRcdFx0fSxcblx0XHRcdFx0b3Blbk1vZGFscykpO1xuXHR9KTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJGluaXQgPSBmdW5jdGlvbiAoc2Vzc2lvbklkKSB7XG5cdHZhciBjdXJyZW50T3Blbk1vZGFscyA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRbXSk7XG5cdHZhciBjdXJyZW50VXJsID0gX3VzZXIkcHJvamVjdCRVcmkkZ2V0Q3VycmVudChcblx0XHR7Y3RvcjogJ19UdXBsZTAnfSk7XG5cdHZhciBpbml0aWFsTW9kZWwgPSBBMyhfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1R5cGVzJE1vZGVsLCBjdXJyZW50T3Blbk1vZGFscywgY3VycmVudFVybCwgc2Vzc2lvbklkKTtcblx0cmV0dXJuIHtcblx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XzA6IGluaXRpYWxNb2RlbCxcblx0XHRfMTogX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRyZXBsYWNlU3RhdGUoaW5pdGlhbE1vZGVsKVxuXHR9O1xufTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJG9uUG9wU3RhdGUgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfUGxhdGZvcm0uaW5jb21pbmdQb3J0KFxuXHQnb25Qb3BTdGF0ZScsXG5cdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG9uZU9mKFxuXHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFtcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkbnVsbChfZWxtX2xhbmckY29yZSRNYXliZSROb3RoaW5nKSxcblx0XHRcdFx0QTIoXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG1hcCxcblx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkTWF5YmUkSnVzdCxcblx0XHRcdFx0QTIoXG5cdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkYW5kVGhlbixcblx0XHRcdFx0XHRBMihcblx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlX29wc1snOj0nXSxcblx0XHRcdFx0XHRcdCdvcGVuTW9kYWxzJyxcblx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGxpc3QoXG5cdFx0XHRcdFx0XHRcdEEyKFxuXHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGFuZFRoZW4sXG5cdFx0XHRcdFx0XHRcdFx0QTIoX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGVfb3BzWyc6PSddLCAnc2VsZWN0b3InLCBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRzdHJpbmcpLFxuXHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uIChzZWxlY3Rvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIEEyKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRhbmRUaGVuLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRBMihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZV9vcHNbJzo9J10sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0J3RhcmdldFVybCcsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkb25lT2YoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRudWxsKF9lbG1fbGFuZyRjb3JlJE1heWJlJE5vdGhpbmcpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG1hcCwgX2VsbV9sYW5nJGNvcmUkTWF5YmUkSnVzdCwgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkc3RyaW5nKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRdKSkpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAodGFyZ2V0VXJsKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHN1Y2NlZWQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7c2VsZWN0b3I6IHNlbGVjdG9yLCB0YXJnZXRVcmw6IHRhcmdldFVybH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR9KSkpLFxuXHRcdFx0XHRcdGZ1bmN0aW9uIChvcGVuTW9kYWxzKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGFuZFRoZW4sXG5cdFx0XHRcdFx0XHRcdEEyKF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlX29wc1snOj0nXSwgJ3VybCcsIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHN0cmluZyksXG5cdFx0XHRcdFx0XHRcdGZ1bmN0aW9uICh1cmwpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdFx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRhbmRUaGVuLFxuXHRcdFx0XHRcdFx0XHRcdFx0QTIoX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGVfb3BzWyc6PSddLCAnc2Vzc2lvbklkJywgX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkaW50KSxcblx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uIChzZXNzaW9uSWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHN1Y2NlZWQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0e29wZW5Nb2RhbHM6IG9wZW5Nb2RhbHMsIHVybDogdXJsLCBzZXNzaW9uSWQ6IHNlc3Npb25JZH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pKVxuXHRcdFx0XSkpKTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJG9uTW9kYWxPcGVuID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1BsYXRmb3JtLmluY29taW5nUG9ydChcblx0J29uTW9kYWxPcGVuJyxcblx0QTIoXG5cdFx0X2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkYW5kVGhlbixcblx0XHRBMihfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZV9vcHNbJzo9J10sICdzZWxlY3RvcicsIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHN0cmluZyksXG5cdFx0ZnVuY3Rpb24gKHNlbGVjdG9yKSB7XG5cdFx0XHRyZXR1cm4gQTIoXG5cdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGFuZFRoZW4sXG5cdFx0XHRcdEEyKFxuXHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlX29wc1snOj0nXSxcblx0XHRcdFx0XHQndGFyZ2V0VXJsJyxcblx0XHRcdFx0XHRfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRvbmVPZihcblx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJG51bGwoX2VsbV9sYW5nJGNvcmUkTWF5YmUkTm90aGluZyksXG5cdFx0XHRcdFx0XHRcdFx0QTIoX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkbWFwLCBfZWxtX2xhbmckY29yZSRNYXliZSRKdXN0LCBfZWxtX2xhbmckY29yZSRKc29uX0RlY29kZSRzdHJpbmcpXG5cdFx0XHRcdFx0XHRcdF0pKSksXG5cdFx0XHRcdGZ1bmN0aW9uICh0YXJnZXRVcmwpIHtcblx0XHRcdFx0XHRyZXR1cm4gX2VsbV9sYW5nJGNvcmUkSnNvbl9EZWNvZGUkc3VjY2VlZChcblx0XHRcdFx0XHRcdHtzZWxlY3Rvcjogc2VsZWN0b3IsIHRhcmdldFVybDogdGFyZ2V0VXJsfSk7XG5cdFx0XHRcdH0pO1xuXHRcdH0pKTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJG9uTW9kYWxDbG9zZSA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9QbGF0Zm9ybS5pbmNvbWluZ1BvcnQoJ29uTW9kYWxDbG9zZScsIF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJHN0cmluZyk7XG52YXIgX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRzdWJzY3JpcHRpb25zID0gZnVuY3Rpb24gKG1vZGVsKSB7XG5cdHJldHVybiBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9TdWIkYmF0Y2goXG5cdFx0X2VsbV9sYW5nJGNvcmUkTmF0aXZlX0xpc3QuZnJvbUFycmF5KFxuXHRcdFx0W1xuXHRcdFx0XHRfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJG9uUG9wU3RhdGUoX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9UeXBlcyRQb3BTdGF0ZSksXG5cdFx0XHRcdF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkb25Nb2RhbE9wZW4oX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9UeXBlcyRNb2RhbE9wZW4pLFxuXHRcdFx0XHRfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJG9uTW9kYWxDbG9zZShfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1R5cGVzJE1vZGFsQ2xvc2UpXG5cdFx0XHRdKSk7XG59O1xudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkcmVsb2FkID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1BsYXRmb3JtLm91dGdvaW5nUG9ydChcblx0J3JlbG9hZCcsXG5cdGZ1bmN0aW9uICh2KSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH0pO1xudmFyIF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkdXBkYXRlID0gRjIoXG5cdGZ1bmN0aW9uIChtc2csIG1vZGVsKSB7XG5cdFx0dmFyIF9wMyA9IG1zZztcblx0XHRzd2l0Y2ggKF9wMy5jdG9yKSB7XG5cdFx0XHRjYXNlICdQb3BTdGF0ZSc6XG5cdFx0XHRcdHZhciBfcDQgPSBfcDMuXzA7XG5cdFx0XHRcdGlmIChfcDQuY3RvciA9PT0gJ05vdGhpbmcnKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRcdF8wOiBtb2RlbCxcblx0XHRcdFx0XHRcdF8xOiBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJHJlcGxhY2VTdGF0ZShtb2RlbClcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhciBfcDUgPSBfcDQuXzA7XG5cdFx0XHRcdFx0dmFyIG5ld01vZGVsID0gX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1V0aWxzLnVwZGF0ZShcblx0XHRcdFx0XHRcdG1vZGVsLFxuXHRcdFx0XHRcdFx0e29wZW5Nb2RhbHM6IF9wNS5vcGVuTW9kYWxzfSk7XG5cdFx0XHRcdFx0cmV0dXJuIF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5lcShfcDUuc2Vzc2lvbklkLCBtb2RlbC5zZXNzaW9uSWQpID8ge1xuXHRcdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdFx0XzA6IG5ld01vZGVsLFxuXHRcdFx0XHRcdFx0XzE6IEEyKF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkY29uZm9ybVdpbmRvd1RvU3RhdGUsIF9wNSwgbW9kZWwpXG5cdFx0XHRcdFx0fSA6IHtcblx0XHRcdFx0XHRcdGN0b3I6ICdfVHVwbGUyJyxcblx0XHRcdFx0XHRcdF8wOiBuZXdNb2RlbCxcblx0XHRcdFx0XHRcdF8xOiBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWQkYmF0Y2goXG5cdFx0XHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFx0XHRcdFx0XHRbXG5cdFx0XHRcdFx0XHRcdFx0XHRfdXNlciRwcm9qZWN0JEhpc3RvcnkkcmVwbGFjZVN0YXRlKF9wNSksXG5cdFx0XHRcdFx0XHRcdFx0XHRfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJHJlbG9hZChcblx0XHRcdFx0XHRcdFx0XHRcdHtjdG9yOiAnX1R1cGxlMCd9KVxuXHRcdFx0XHRcdFx0XHRcdF0pKVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdGNhc2UgJ01vZGFsT3Blbic6XG5cdFx0XHRcdHZhciBfcDYgPSBfcDMuXzA7XG5cdFx0XHRcdHZhciBtb2RlbFBsdXNNb2RhbCA9IF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy51cGRhdGUoXG5cdFx0XHRcdFx0bW9kZWwsXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0b3Blbk1vZGFsczogQTIoX2VsbV9sYW5nJGNvcmUkTGlzdF9vcHNbJzo6J10sIF9wNiwgbW9kZWwub3Blbk1vZGFscylcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0dmFyIG1vZGFsUmVnaXN0ZXJlZEFzT3BlbiA9IEEyKF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkaXNNb2RhbE9wZW4sIG1vZGVsLm9wZW5Nb2RhbHMsIF9wNi5zZWxlY3Rvcik7XG5cdFx0XHRcdHJldHVybiBtb2RhbFJlZ2lzdGVyZWRBc09wZW4gPyB7Y3RvcjogJ19UdXBsZTInLCBfMDogbW9kZWwsIF8xOiBfZWxtX2xhbmckY29yZSRQbGF0Zm9ybV9DbWQkbm9uZX0gOiB7XG5cdFx0XHRcdFx0Y3RvcjogJ19UdXBsZTInLFxuXHRcdFx0XHRcdF8wOiBtb2RlbFBsdXNNb2RhbCxcblx0XHRcdFx0XHRfMTogX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRwdXNoU3RhdGUobW9kZWxQbHVzTW9kYWwpXG5cdFx0XHRcdH07XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR2YXIgX3A3ID0gX3AzLl8wO1xuXHRcdFx0XHR2YXIgbGlzdFdpdGhvdXRNb2RhbCA9IEEyKFxuXHRcdFx0XHRcdF9lbG1fbGFuZyRjb3JlJExpc3QkZmlsdGVyLFxuXHRcdFx0XHRcdGZ1bmN0aW9uIChuKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gIV9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9VdGlscy5lcShuLnNlbGVjdG9yLCBfcDcpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bW9kZWwub3Blbk1vZGFscyk7XG5cdFx0XHRcdHZhciBtb2RlbE1pbnVzTW9kYWwgPSBfZWxtX2xhbmckY29yZSROYXRpdmVfVXRpbHMudXBkYXRlKFxuXHRcdFx0XHRcdG1vZGVsLFxuXHRcdFx0XHRcdHtvcGVuTW9kYWxzOiBsaXN0V2l0aG91dE1vZGFsfSk7XG5cdFx0XHRcdHZhciBtb2RhbFJlZ2lzdGVyZWRBc0Nsb3NlZCA9IF9lbG1fbGFuZyRjb3JlJEJhc2ljcyRub3QoXG5cdFx0XHRcdFx0QTIoX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRpc01vZGFsT3BlbiwgbW9kZWwub3Blbk1vZGFscywgX3A3KSk7XG5cdFx0XHRcdHJldHVybiBtb2RhbFJlZ2lzdGVyZWRBc0Nsb3NlZCA/IHtjdG9yOiAnX1R1cGxlMicsIF8wOiBtb2RlbCwgXzE6IF9lbG1fbGFuZyRjb3JlJFBsYXRmb3JtX0NtZCRub25lfSA6IHtcblx0XHRcdFx0XHRjdG9yOiAnX1R1cGxlMicsXG5cdFx0XHRcdFx0XzA6IG1vZGVsTWludXNNb2RhbCxcblx0XHRcdFx0XHRfMTogX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlcl9TdGF0ZSRwdXNoU3RhdGUobW9kZWxNaW51c01vZGFsKVxuXHRcdFx0XHR9O1xuXHRcdH1cblx0fSk7XG5cbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyJHZpZXcgPSBmdW5jdGlvbiAobW9kZWwpIHtcblx0cmV0dXJuIEEyKFxuXHRcdF9lbG1fbGFuZyRodG1sJEh0bWwkZGl2LFxuXHRcdF9lbG1fbGFuZyRjb3JlJE5hdGl2ZV9MaXN0LmZyb21BcnJheShcblx0XHRcdFtdKSxcblx0XHRfZWxtX2xhbmckY29yZSROYXRpdmVfTGlzdC5mcm9tQXJyYXkoXG5cdFx0XHRbXSkpO1xufTtcbnZhciBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyJG1haW4gPSB7XG5cdG1haW46IF9lbG1fbGFuZyRodG1sJEh0bWxfQXBwJHByb2dyYW1XaXRoRmxhZ3MoXG5cdFx0e2luaXQ6IF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkaW5pdCwgdmlldzogX3VzZXIkcHJvamVjdCRNb2RhbFJvdXRlciR2aWV3LCB1cGRhdGU6IF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXJfU3RhdGUkdXBkYXRlLCBzdWJzY3JpcHRpb25zOiBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyX1N0YXRlJHN1YnNjcmlwdGlvbnN9KSxcblx0ZmxhZ3M6IF9lbG1fbGFuZyRjb3JlJEpzb25fRGVjb2RlJGludFxufTtcblxudmFyIEVsbSA9IHt9O1xuRWxtWydNb2RhbFJvdXRlciddID0gRWxtWydNb2RhbFJvdXRlciddIHx8IHt9O1xuX2VsbV9sYW5nJGNvcmUkTmF0aXZlX1BsYXRmb3JtLmFkZFB1YmxpY01vZHVsZShFbG1bJ01vZGFsUm91dGVyJ10sICdNb2RhbFJvdXRlcicsIHR5cGVvZiBfdXNlciRwcm9qZWN0JE1vZGFsUm91dGVyJG1haW4gPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IF91c2VyJHByb2plY3QkTW9kYWxSb3V0ZXIkbWFpbik7XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lWydhbWQnXSlcbntcbiAgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHsgcmV0dXJuIEVsbTsgfSk7XG4gIHJldHVybjtcbn1cblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09IFwib2JqZWN0XCIpXG57XG4gIG1vZHVsZVsnZXhwb3J0cyddID0gRWxtO1xuICByZXR1cm47XG59XG5cbnZhciBnbG9iYWxFbG0gPSB0aGlzWydFbG0nXTtcbmlmICh0eXBlb2YgZ2xvYmFsRWxtID09PSBcInVuZGVmaW5lZFwiKVxue1xuICB0aGlzWydFbG0nXSA9IEVsbTtcbiAgcmV0dXJuO1xufVxuXG5mb3IgKHZhciBwdWJsaWNNb2R1bGUgaW4gRWxtKVxue1xuICBpZiAocHVibGljTW9kdWxlIGluIGdsb2JhbEVsbSlcbiAge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlcmUgYXJlIHR3byBFbG0gbW9kdWxlcyBjYWxsZWQgYCcgKyBwdWJsaWNNb2R1bGUgKyAnYCBvbiB0aGlzIHBhZ2UhIFJlbmFtZSBvbmUgb2YgdGhlbS4nKTtcbiAgfVxuICBnbG9iYWxFbG1bcHVibGljTW9kdWxlXSA9IEVsbVtwdWJsaWNNb2R1bGVdO1xufVxuXG59KS5jYWxsKHRoaXMpO1xuXG4iLCIvKiBnbG9iYWxzIEVsbSwgJCAqL1xuLyogZXNsaW50LWRpc2FibGUgbmV3LWNhcCwgbm8tdW5kZXJzY29yZS1kYW5nbGUgKi9cblxuXG4vKipcbiAqIElmIGl0J3Mgbm90IGEgTWF5YmUsIHJldHVybnMgd2hhdGV2ZXIgdmFsdWUgdGhhdCBpcywgaWYgaXQgaXNcbiAqIGEgTWF5YmUsIHJldHVybnMgYHZhbHVlYCBmb3IgYEp1c3QgdmFsdWVgIGFuZCBgbnVsbGAgZm9yIGBOb3RoaW5nYFxuICogQG1ldGhvZCBmcm9tTWF5YmVcbiAqIEBwYXJhbSAge09iamVjdDxBbnk+IHwgQW55IH0gdmFsXG4gKiBAcmV0dXJuIHtBbnl9XG4gKi9cbmNvbnN0IGZyb21NYXliZSA9IHZhbCA9PiB7XG4gIGNvbnN0IGlzTWF5YmUgPSB2YWwgJiYgdmFsLmN0b3I7XG5cbiAgaWYgKCFpc01heWJlKSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIHJldHVybiB2YWwuXzAgPyB2YWwuXzAgOiBudWxsO1xufTtcblxuY29uc3QgcGFyc2VFbG1MaXN0ID0gbCA9PiB7XG4gIGlmIChBcnJheS5pc0FycmF5KGwpKSB7XG4gICAgcmV0dXJuIGw7XG4gIH1cblxuICBsZXQgbGlzdCA9IFtdXG4gIGxldCBjb3VudGVyID0gMFxuICBsZXQga2V5ID0gYF8ke2NvdW50ZXJ9YDtcbiAgd2hpbGUgKGxba2V5XSAhPT0gdW5kZWZpbmVkICYmIGxba2V5XS5jdG9yICE9PSAnW10nKSB7XG4gICAgbGlzdCA9IGxpc3QuY29uY2F0KGxba2V5XSk7XG4gICAgY291bnRlciA9IGNvdW50ZXIgKyAxXG4gICAga2V5ID0gYF8ke2NvdW50ZXJ9YDtcbiAgfVxuXG4gIHJldHVybiBsaXN0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYW4gRWxtIGFjY2VwdGFibGUgTW9kYWwgb2JqZWN0XG4gKiBAbWV0aG9kIE1vZGFsXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0gIHtTdHJpbmcgfCBNYXliZSBTdHJpbmd9IHRhcmdldFVybFxuICovXG5jb25zdCBNb2RhbCA9IGZ1bmN0aW9uICh7IHNlbGVjdG9yLCB0YXJnZXRVcmwgfSA9IHt9KSB7XG4gIGlmICghc2VsZWN0b3IpIHtcbiAgICAvLyBJdCB3YXMgbm90IHNldCBieSBFbG1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHVybCA9IGZyb21NYXliZSh0YXJnZXRVcmwpO1xuICByZXR1cm4geyBzZWxlY3RvciwgdGFyZ2V0VXJsOiB1cmwgfTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBFbG0gYWNjZXB0YWJsZSBIaXN0b3J5U3RhdGUgb2JqZWN0XG4gKiBUaGlzIGlzIHVzZWQgdG8gbWFrZSB0aGUgbGluayBFbG0tSlMgYW5kIEpTLUVsbVxuICogQG1ldGhvZCBIaXN0b3J5U3RhdGVcbiAqIEBwYXJhbSAge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0gIHtBcnJheTxNb2RhbD59XG4gKi9cbmNvbnN0IEhpc3RvcnlTdGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICBjb25zdCB7IHVybCwgb3Blbk1vZGFscywgc2Vzc2lvbklkIH0gPSBzdGF0ZSB8fCB7fTtcbiAgaWYgKCF1cmwpIHtcbiAgICAvLyBJdCB3YXMgbm90IHNldCBieSBFbG1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IG1vZGFscyA9IHBhcnNlRWxtTGlzdChvcGVuTW9kYWxzKS5tYXAoTW9kYWwpO1xuICBtb2RhbHMuZm9yRWFjaChtID0+IHtcbiAgICBpZiAoIW0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0EgbnVsbCBtb2RhbCB3YXMgZm91bmQgaW4gYSBoaXN0b3J5IHN0YXRlLiAnXG4gICAgICAgICsgYFNvbWV0aGluZyBpcyB3cm9uZy4gSGVyZSBhcmUgYWxsIHRoZSBtb2RhbHMgJHtKU09OLnN0cmluZ2lmeShtb2RhbHMpfWBcbiAgICAgICk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHsgdXJsLCBzZXNzaW9uSWQsIG9wZW5Nb2RhbHM6IG1vZGFscyB9O1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gV2Ugd2lsbCBwcm92aWRlIGEgdW5pcXVlIGlkIGZvciBvdXIgYXBwXG5jb25zdCBzZXNzaW9uSWQgPSBEYXRlLm5vdygpO1xuY29uc3QgYXBwID0gRWxtLk1vZGFsUm91dGVyLmZ1bGxzY3JlZW4oc2Vzc2lvbklkKTtcblxuLy8gV2Ugc2VuZCBzdHVmZiB0byBFbG0gd2l0aCBzdWdnZXN0aW9uc1xuY29uc3Qge1xuICBvblBvcFN0YXRlLFxuICBvbk1vZGFsT3BlbixcbiAgb25Nb2RhbENsb3NlLFxufSA9IGFwcC5wb3J0cztcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgKGUpID0+IHtcbiAgY29uc3QgaGlzdFN0YXRlID0gSGlzdG9yeVN0YXRlKGUuc3RhdGUpO1xuICBvblBvcFN0YXRlLnNlbmQoaGlzdFN0YXRlKTtcbn0pO1xuXG5mdW5jdGlvbiBnZXRNb2RhbEluZm8oZSkge1xuICBjb25zdCB0YXJnZXRVcmwgPSBlLnJlbGF0ZWRUYXJnZXQgJiYgZS5yZWxhdGVkVGFyZ2V0LmdldEF0dHJpYnV0ZSgnaHJlZicpXG4gICAgICA/IGUucmVsYXRlZFRhcmdldC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKVxuICAgICAgOiBudWxsO1xuXG4gIGNvbnN0IHNlbGVjdG9yID0gYCMke2UudGFyZ2V0LmlkfWA7XG4gIGNvbnN0IG1vZGFsSW5mbyA9IE1vZGFsKHsgc2VsZWN0b3IsIHRhcmdldFVybCB9KTtcbiAgcmV0dXJuIG1vZGFsSW5mbztcbn1cblxuJChkb2N1bWVudC5ib2R5KVxuICAub24oJ3Nob3cuYnMubW9kYWwnLCAoZSkgPT4gb25Nb2RhbE9wZW4uc2VuZChnZXRNb2RhbEluZm8oZSkpKVxuICAub24oJ2hpZGUuYnMubW9kYWwnLCAoZSkgPT4ge1xuICAgIGNvbnN0IG1vZGFsID0gZ2V0TW9kYWxJbmZvKGUpO1xuICAgIGlmICghbW9kYWwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTW9kYWwgY2xvc2UgZXZlbnQgZGlkIG5vdCBjb250YWluIGEgbW9kYWwuIFNvbWV0aGluZyBpcyB3cm9uZy4nKTtcbiAgICB9XG4gICAgb25Nb2RhbENsb3NlLnNlbmQobW9kYWwuc2VsZWN0b3IpO1xuICB9KTtcblxuYXBwLnBvcnRzLnJlbG9hZC5zdWJzY3JpYmUoKCkgPT4ge1xuICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG59KTtcbiJdfQ==
