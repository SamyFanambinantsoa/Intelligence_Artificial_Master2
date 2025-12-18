
def load_words(filename="mots_malagasy_all.txt"):
    with open(filename, "r", encoding="utf-8") as f:
        return [line.strip().lower() for line in f if line.strip()]


def levenshtein(a, b):
    if a == b:
        return 0
    if len(a) == 0:
        return len(b)
    if len(b) == 0:
        return len(a)

    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]

    for i in range(len(a) + 1):
        dp[i][0] = i
    for j in range(len(b) + 1):
        dp[0][j] = j

    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1
            dp[i][j] = min(
                dp[i - 1][j] + 1,      # suppression
                dp[i][j - 1] + 1,      # insertion
                dp[i - 1][j - 1] + cost  # substitution
            )
    return dp[-1][-1]


# -----------------------------
# Lemmatisation malagasy
# -----------------------------
PREFIXES = ["mpam", "mpan", "maha", "mam", "man", "fan", "fam", "fi", "ma", "mi"]
SUFFIXES = ["ana", "ina", "na"]

def lemmatize(word):
    w = word.lower()

    # enlever préfixe (le plus long d'abord)
    for p in sorted(PREFIXES, key=len, reverse=True):
        if w.startswith(p):
            w = w[len(p):]
            break

    # enlever suffixe
    for s in sorted(SUFFIXES, key=len, reverse=True):
        if w.endswith(s):
            w = w[:-len(s)]
            break

    return w


# -----------------------------
# Comparaison Levenshtein
# -----------------------------
def find_closest_words(target_word, words, top_n=10):
    target_root = lemmatize(target_word)

    results = []
    for w in words:
        root = lemmatize(w)
        dist = levenshtein(target_root, root)
        results.append((w, root, dist))

    results.sort(key=lambda x: x[2])
    print(results)
    return results[:top_n]


# -----------------------------
# Exemple d'utilisation
# -----------------------------
if __name__ == "__main__":
    words = load_words("fototeny.txt")

    target = "misongona"
    target_root = lemmatize(target)

    print(f"\nMot : {target}")
    print(f"Lemme estimé : {target_root}\n")

    closest = find_closest_words(target, words, top_n=10)

    print("Mots les plus proches (Levenshtein) :")
    for word, root, dist in closest:
        print(f"  {word:<20} → {root:<10} (distance={dist})")
