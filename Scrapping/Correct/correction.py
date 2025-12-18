
def load_words(filename):
    with open(filename, "r", encoding="utf-8") as f:
        return [line.strip().lower() for line in f if line.strip()]

# -----------------------------
# Calcul distance de Levenshtein
# -----------------------------
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
# Correction de mot
# -----------------------------
def correct_word(word):
    """
    Propose une correction pour un mot en utilisant la distance de Levenshtein.
    
    Args:
        word (str): mot à corriger
        words_list (list): liste de mots valides
        max_suggestions (int): nombre maximum de suggestions à retourner
    
    Returns:
        list de tuples: [(mot_suggéré, distance), ...]
    """
    word = word.lower()
    distances = []

    words_list = load_words("mots_malagasy.txt") 

    for w in words_list:
        dist = levenshtein(word, w)
        distances.append((w, dist))

    # Trier par distance croissante
    distances.sort(key=lambda x: x[1])

    # Retourner les N meilleures suggestions
    
    words_only = [w for w, _ in distances[:5]]
    return words_only

words = load_words("mots_malagasy.txt")
print(correct_word("salammma"))