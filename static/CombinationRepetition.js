function CombinationRepetitionUtil(chosen, arr, index, r, start, end)
{
    if (index == r) {
        let combination = [];
        for (var i = 0; i < r; i++) {
            combination.push(arr[chosen[i]]);
        }
        combinations.push(combination);
        return;
    }

    for (var i = start; i <= end; i++) {
        chosen[index] = i;
        CombinationRepetitionUtil(chosen, arr, index + 1,
                r, i, end);
    }
    return;
}

var combinations = [];

export function CombinationRepetition(arr, n, r)
{
    var chosen = Array.from({length: (r + 1)}, (_, i) => 0);

    CombinationRepetitionUtil(chosen, arr, 0, r, 0, n - 1);

    return combinations;
}