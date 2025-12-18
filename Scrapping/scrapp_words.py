import requests
from bs4 import BeautifulSoup
import time
import json
import re


def get_all_ranges(base_url="https://tenymalagasy.org/bins/alphaLists?lang=mg"):
    """
    Récupère automatiquement tous les ranges disponibles depuis la page principale.
    
    Returns:
        liste de tous les ranges trouvés
    """
    print("Récupération de tous les ranges disponibles...")
    
    try:
        response = requests.get(base_url, verify=False)
        response.encoding = 'utf-8'
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Trouver tous les liens avec href contenant "range="
        range_links = soup.find_all('a', href=re.compile(r'range='))
        
        ranges = []
        for link in range_links:
            href = link.get('href')
            # Extraire le range du href
            match = re.search(r'range=([^&]+)', href)
            if match:
                range_val = match.group(1)
                ranges.append(range_val)
        
        # Enlever les doublons et trier
        ranges = sorted(list(set(ranges)))
        
        print(f"  → {len(ranges)} ranges trouvés: {', '.join(ranges[:10])}...")
        return ranges
        
    except Exception as e:
        print(f"  ✗ Erreur lors de la récupération des ranges: {e}")
        return []


def scrape_teny_malagasy(ranges):
    """
    Scrape les mots depuis tenymalagasy.org pour une liste de ranges.
    Récupère uniquement les mots dans le premier <td> avec href commençant par /bins/teny2
    
    Args:
        ranges: liste de ranges (ex: ['d', 'e', 'f', ...])
    
    Returns:
        dictionnaire avec les ranges comme clés et les listes de mots comme valeurs
    """
    all_data = {}
    base_url = "https://tenymalagasy.org/bins/alphaLists"
    
    for range_val in ranges:
        print(f"Scraping range: {range_val}...")
        
        try:
            # Construire l'URL
            url = f"{base_url}?lang=mg&range={range_val}"
            
            # Faire la requête avec encodage UTF-8
            response = requests.get(url, verify=False)
            response.encoding = 'utf-8'
            response.raise_for_status()
            
            # Parser le HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Trouver toutes les lignes de tableau (tr)
            rows = soup.find_all('tr')
            
            words = []
            for row in rows:
                # Récupérer le premier td de chaque ligne
                first_td = row.find('td')
                if first_td:
                    # Chercher un lien dans ce premier td
                    link = first_td.find('a', href=lambda x: x and x.startswith('/bins/teny2'))
                    if link:
                        word = link.get_text(strip=True)
                        # Filtrer les mots vides ou avec caractères d'encodage incorrects
                        if word and 'Ã' not in word and word not in ['', ' ']:
                            words.append(word)
            
            all_data[range_val] = words
            
            print(f"  → {len(words)} mots trouvés")
            
            # Pause pour ne pas surcharger le serveur
            time.sleep(0.5)
            
        except Exception as e:
            print(f"  ✗ Erreur pour {range_val}: {e}")
            all_data[range_val] = []
    
    return all_data


def save_words_to_json(data, filename='mots_malagasy.json'):
    """Sauvegarde les mots dans un fichier JSON."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    total_words = sum(len(words) for words in data.values())
    print(f"\n{total_words} mots sauvegardés dans {filename}")


def save_words_to_txt(data, filename='mots_malagasy.txt'):
    """Sauvegarde tous les mots dans un fichier texte (liste simple)."""
    all_words = []
    for words in data.values():
        all_words.extend(words)
    
    with open(filename, 'w', encoding='utf-8') as f:
        for word in all_words:
            f.write(word + '\n')
    print(f"{len(all_words)} mots sauvegardés dans {filename}")


# Exemple d'utilisation
if __name__ == "__main__":
    # Désactiver les warnings SSL
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    print("Début du scraping...\n")
    
    # Option 1: Récupérer automatiquement tous les ranges
    ranges = get_all_ranges()
    
    # Option 2: Ou spécifier manuellement les ranges
    # ranges = ['d', 'e', 'f', 'g']
    
    if not ranges:
        print("Aucun range trouvé. Abandon.")
        exit()
    
    # Scraper tous les ranges
    data = scrape_teny_malagasy(ranges)
    
    # Calculer le total
    total_words = sum(len(words) for words in data.values())
    
    # Afficher les statistiques
    print(f"\n{'='*50}")
    print(f"Total: {total_words} mots récupérés sur {len(ranges)} ranges")
    print(f"{'='*50}")
    
    # Sauvegarder en JSON (format structuré par range)
    save_words_to_json(data, 'mots_malagasy.json')
    
    # Optionnel: Sauvegarder aussi en TXT (liste simple)
    save_words_to_txt(data, 'mots_malagasy.txt')
    
    # Afficher quelques exemples
    print("\nPremiers mots par range:")
    for range_val, words in list(data.items())[:5]:
        if words:
            print(f"\n{range_val}: ({len(words)} mots)")
            for word in words[:5]:
                print(f"  - {word}")