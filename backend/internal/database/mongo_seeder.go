package database

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func SeedKeralaAdminData() {
	log.Println("Checking for Kerala Admin Data...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := MongoDB.Collection("reference_data")

	count, err := collection.CountDocuments(ctx, bson.M{"type": "kerala_admin_data"})
	if err != nil {
		log.Println("Error checking mongo seeder:", err)
		return
	}

	if count > 0 {
		return
	}

	adminData := bson.M{
		"type": "kerala_admin_data",
		"data": bson.M{
			"districts": []string{
				"Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
				"Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram",
				"Kozhikode", "Wayanad", "Kannur", "Kasaragod",
			},
			"corporations": bson.M{
				"Thiruvananthapuram": []string{"Thiruvananthapuram Corporation"},
				"Kollam":             []string{"Kollam Corporation"},
				"Ernakulam":          []string{"Kochi Corporation"},
				"Thrissur":           []string{"Thrissur Corporation"},
				"Kozhikode":          []string{"Kozhikode Corporation"},
				"Kannur":             []string{"Kannur Corporation"},
			},
			"municipalities": bson.M{
				"Thiruvananthapuram": []string{"Neyyattinkara", "Nedumangad", "Attingal", "Varkala"},
				"Kollam":             []string{"Punalur", "Karunagappally", "Paravur", "Kottarakkara"},
				"Pathanamthitta":     []string{"Thiruvalla", "Pathanamthitta", "Adoor", "Pandalam"},
				"Alappuzha":          []string{"Alappuzha", "Kayamkulam", "Cherthala", "Mavelikkara", "Chengannur", "Haripad"},
				"Kottayam":           []string{"Kottayam", "Changanassery", "Pala", "Vaikom", "Ettumanoor", "Erattupetta"},
				"Idukki":             []string{"Thodupuzha", "Kattappana"},
				"Ernakulam":          []string{"Thrippunithura", "Muvattupuzha", "Kothamangalam", "Perumbavoor", "Aluva", "North Paravur", "Angamaly", "Kalamassery", "Maradu", "Eloor", "Thrikkakara", "Piravom", "Koothattukulam"},
				"Thrissur":           []string{"Chalakudy", "Kunnamkulam", "Kodungallur", "Chavakkad", "Guruvayoor", "Irinjalakuda", "Wadakkanchery"},
				"Palakkad":           []string{"Palakkad", "Shornur", "Chittur-Thathamangalam", "Ottappalam", "Mannarkkad", "Pattambi", "Cherpulassery"},
				"Malappuram":         []string{"Malappuram", "Manjeri", "Ponnani", "Tirur", "Perinthalmanna", "Nilambur", "Kottakkal", "Valanchery", "Kondotty", "Tanur", "Parappanangadi", "Tirurangadi"},
				"Kozhikode":          []string{"Vatakara", "Koyilandy", "Ramanattukara", "Koduvally", "Mukkam", "Payyoli", "Feroke"},
				"Wayanad":            []string{"Kalpetta", "Mananthavady", "Sulthan Bathery"},
				"Kannur":             []string{"Taliparamba", "Payyannur", "Thalassery", "Mattannur", "Koothuparamba", "Anthoor", "Iritty", "Panoor", "Sreekandapuram"},
				"Kasaragod":          []string{"Kasaragod", "Kanhangad", "Nileshwar"},
			},
			"blocks": bson.M{
				"Thiruvananthapuram": []string{"Parassala", "Athiyannoor", "Perunkadavila", "Nemom", "Pothencode", "Vamanapuram", "Kazhakoottam", "Nedumangad", "Vellanad", "Chirayinkizhu", "Kilimanoor", "Varkala"},
				"Kollam":             []string{"Ochira", "Karunagappally", "Sasthamcotta", "Pathanapuram", "Anchal", "Kottarakkara", "Chittumala", "Chavara", "Mukhathala", "Ithikkara", "Chadayamangalam", "Vettikkavala"},
				"Pathanamthitta":     []string{"Mallappally", "Pulikeezhu", "Koipuram", "Elanthoor", "Ranni", "Konni", "Pandalam", "Parakode"},
				"Alappuzha":          []string{"Ambalappuzha", "Aryad", "Bharanikkavu", "Champakkulam", "Chengannur", "Haripad", "Kanjikkuzhi", "Mavelikkara", "Muthukulam", "Pattanakkad", "Thaikkattusseri", "Veliyanad"},
				"Kottayam":           []string{"Erattupetta", "Ettumanoor", "Kaduthuruthy", "Kanjirappally", "Lalam", "Madappally", "Pallom", "Pampady", "Uzhavoor", "Vaikom", "Vazhoor"},
				"Idukki":             []string{"Adimali", "Azhutha", "Devikulam", "Elamdesom", "Idukki", "Kattappana", "Nedumkandam", "Thodupuzha"},
				"Ernakulam":          []string{"Alangad", "Angamaly", "Edappally", "Koovappadi", "Kothamangalam", "Mulanthuruthy", "Muvattupuzha", "Palluruthy", "Pampakuda", "Parakkadavu", "Paravur", "Vadavucode", "Vazhakulam", "Vypeen"},
				"Thrissur":           []string{"Anthikkad", "Chalakkudy", "Chavakkad", "Cherpu", "Chowwannur", "Irinjalakkuda", "Kodakara", "Kodungallur", "Mala", "Mathilakam", "Mullasseri", "Ollukkara", "Pazhayannoor", "Puzhackal", "Thalikulam", "Vadakkancherry", "Vellangallur"},
				"Palakkad":           []string{"Alathur", "Attappady", "Chittoor", "Kollangode", "Kuzhalmannam", "Malampuzha", "Mannarkkad", "Nenmara", "Ottappalam", "Palakkad", "Pattambi", "Sreekrishnapuram", "Thrithala"},
				"Malappuram":         []string{"Areekode", "Kalikavu", "Kondotty", "Kuttippuram", "Malappuram", "Mankada", "Nilambur", "Perinthalmanna", "Perumpadappu", "Ponnani", "Tanur", "Tiroorangadi", "Tirur", "Vengara", "Wandoor"},
				"Kozhikode":          []string{"Balusseri", "Chelannur", "Koduvally", "Kozhikode", "Kunnamangalam", "Kunnummel", "Meladi", "Panthalayani", "Perambra", "Thodannur", "Tuneri", "Vadakara"},
				"Wayanad":            []string{"Kalpetta", "Mananthavady", "Panamaram", "Sulthan Bathery"},
				"Kannur":             []string{"Edakkad", "Irikkur", "Iritty", "Kalliasseri", "Kannur", "Kuthuparamba", "Panoor", "Payyannur", "Peravoor", "Taliparamba", "Thalassery"},
				"Kasaragod":          []string{"Karadka", "Kanhangad", "Kasaragod", "Manjeshwaram", "Nileshwaram", "Parappa"},
			},
			"grama_panchayats": bson.M{
				// --- Thiruvananthapuram ---
				"Parassala":     []string{"Chenkal", "Karode", "Kulathoor", "Parassala", "Thirupuram", "Poovar"},
				"Athiyannoor":   []string{"Athiyannur", "Kanjiramkulam", "Karumkulam", "Kottukal", "Venganoor"},
				"Perunkadavila": []string{"Amboori", "Aryancode", "Kallikkad", "Kollayil", "Kunnathukal", "Ottasekharamangalam", "Perumkadavila", "Vellarada"},
				"Nemom":         []string{"Balaramapuram", "Kalliyoor", "Malayinkeezhu", "Maranalloor", "Pallichal", "Vilappil", "Vilavoorkkal"},
				"Pothencode":    []string{"Andoorkonam", "Kadinamkulam", "Mangalapuram", "Pothencode", "Azhoor"},
				"Nedumangad":    []string{"Anad", "Aruvikkara", "Karakulam", "Manikkal", "Panavoor", "Vembayam"},
				"Vellanad":      []string{"Aryanad", "Kuttichal", "Paruthikkuzhy", "Peringamala", "Poovachal", "Tholikkode", "Uzhamalakkal", "Vellanad"},
				"Vamanapuram":   []string{"Kallara", "Nanniyode", "Nellanad", "Pangode", "Pullampara", "Vamanapuram"},
				"Chirayinkizhu": []string{"Anchuthengu", "Chirayinkeezhu", "Kadakkavoor", "Kizhuvilam", "Mudakkal", "Vakkom"},
				"Kilimanoor":    []string{"Karavaram", "Kilimanoor", "Madavoor", "Nagaroor", "Navaikulam", "Pazhayakunnummel", "Pulimath"},
				"Varkala":       []string{"Chemmaruthy", "Cherunniyoor", "Edava", "Elakamon", "Manamboor", "Ottoor", "Vettoor"},

				// --- Kollam ---
				"Ochira":          []string{"Alappad", "Clappana", "Kulasekharapuram", "Ochira", "Thazhava", "Thodiyoor"},
				"Karunagappally":  []string{"Alayamon", "Mynagappally", "Panmana", "Thekkumbhagam", "Thevalakkara"},
				"Sasthamcotta":    []string{"Kunnathur", "Mynagappally", "Poruvazhy", "Sasthamcotta", "Sooranad North", "Sooranad South", "West Kallada"},
				"Pathanapuram":    []string{"Pattazhy", "Pattazhy Vadakkekara", "Piravanthoor", "Thalavoor", "Vilakkudy"},
				"Anchal":          []string{"Alayamon", "Anchal", "Aryankavu", "Eroor", "Karavaloor", "Kulathupuzha", "Thenmala", "Yeroor"},
				"Kottarakkara":    []string{"Ezhukone", "Kareepra", "Kottarakkara", "Kulakkada", "Mylom", "Neduvathoor", "Ummannoor", "Velinalloor"},
				"Chittumala":      []string{"East Kallada", "Kundara", "Monroe Island", "Panayam", "Perayam", "Perinad", "Thrikkaruva"},
				"Chavara":         []string{"Chavara", "Neendakara", "Panmana", "Thekkumbhagam", "Thevalakkara"},
				"Mukhathala":      []string{"Elampalloor", "Kottamkara", "Mayyanad", "Nedumpana", "Thrikkovilvattom"},
				"Ithikkara":       []string{"Adichanalloor", "Chathannoor", "Chirakkara", "Kalluvathukkal", "Poothakkulam", "Pooyappally"},
				"Chadayamangalam": []string{"Chadayamangalam", "Elamadu", "Ittiva", "Kadakkal", "Nilamel", "Velinalloor"},
				"Vettikkavala":    []string{"Melila", "Mylom", "Ummannoor", "Vettikkavala"},

				// --- Pathanamthitta ---
				"Mallappally": []string{"Anicad", "Kallooppara", "Kottangal", "Kunnamthanam", "Mallappally", "Puramattom"},
				"Pulikeezhu":  []string{"Kadapra", "Kuttoor", "Nedumpuram", "Niranam", "Peringara"},
				"Koipuram":    []string{"Ayiroor", "Eraviperoor", "Ezhumattoor", "Koipuram", "Thottapuzhassery"},
				"Elanthoor":   []string{"Chenneerkara", "Cherukole", "Elanthoor", "Kozhencherry", "Mallapuzhassery", "Naranganam", "Omalloor"},
				"Ranni":       []string{"Chittar", "Naranammoozhy", "Perunad", "Ranni", "Ranni-Angadi", "Ranni-Pazhavangadi", "Vadasserikkara", "Vechoochira"},
				"Konni":       []string{"Aruvappulam", "Kalanjoor", "Konni", "Malayalapuzha", "Mylapra", "Pramadom", "Seethathodu", "Thannithode", "Vallicode"},
				"Pandalam":    []string{"Aranmula", "Kulanada", "Mezhuveli", "Pandalam Thekkekara", "Thumpamon"},
				"Parakode":    []string{"Enadimangalam", "Erathu", "Ezhamkulam", "Kadampanad", "Kodumon", "Pallickal"},

				// --- Alappuzha ---
				"Ambalappuzha":    []string{"Ambalappuzha North", "Ambalappuzha South", "Punnapra North", "Punnapra South", "Purakkad"},
				"Aryad":           []string{"Aryad", "Mannancherry", "Mararikulam South"},
				"Bharanikkavu":    []string{"Bharanikkavu", "Chunakkara", "Mavelikkara Thekkekara", "Nooranad", "Palamel", "Thamarakkulam", "Vallikunnam"},
				"Champakkulam":    []string{"Champakkulam", "Edathua", "Kainakary", "Nedumudi", "Thakazhi", "Thalavady"},
				"Chengannur":      []string{"Ala", "Budhanoor", "Cheriyanad", "Mannar", "Mulakuzha", "Pandanad", "Puliyoor", "Thiruvanvandoor", "Venmony"},
				"Haripad":         []string{"Arattupuzha", "Cheppad", "Cheruthana", "Chingoli", "Haripad", "Karuvatta", "Kumarapuram", "Pallippad", "Thrikkunnapuzha", "Veeyapuram"},
				"Kanjikkuzhi":     []string{"Cherthala South", "Kadakkarappally", "Kanjikkuzhi", "Mararikulam North", "Thanneermukkom"},
				"Mavelikkara":     []string{"Chennithala", "Chettikulangara", "Mavelikkara Thamarakkulam", "Thazhakkara", "Thekkekkara"},
				"Muthukulam":      []string{"Arattupuzha", "Cheppad", "Devikulangara", "Kandalloor", "Krishnapuram", "Muthukulam", "Pathiyoor"},
				"Pattanakkad":     []string{"Aroor", "Ezhupunna", "Kodamthuruthu", "Kuthiathode", "Pattanakkad", "Thuravoor", "Vayalar"},
				"Thaikkattusseri": []string{"Arookutty", "Chennam Pallippuram", "Panavally", "Perumbalam", "Thaikkattusseri"},
				"Veliyanad":       []string{"Kavalam", "Muttar", "Neelamperoor", "Pulinkunnu", "Ramankary", "Veliyanad"},

				// --- Kottayam ---
				"Erattupetta":   []string{"Melukavu", "Moonnilavu", "Poonjar", "Poonjar Thekkekkara", "Teekoy", "Thalanad", "Thalappalam", "Thidanad"},
				"Ettumanoor":    []string{"Aimanam", "Arpookara", "Athirampuzha", "Kumarakom", "Neendoor", "Thiruvarppu"},
				"Kaduthuruthy":  []string{"Kaduthuruthy", "Kallara", "Kuruppanthara", "Manjoor", "Mulakulam", "Neezhoor", "Thalayolaparambu", "Velloor"},
				"Kanjirappally": []string{"Chirakkadavu", "Erumely", "Kanjirappally", "Koottickal", "Koruthodu", "Manimala", "Mundakkayam", "Parathodu"},
				"Lalam":         []string{"Bharananganam", "Kadanad", "Karoor", "Kozhuvanal", "Meenachil", "Mutholy"},
				"Madappally":    []string{"Karukachal", "Madappally", "Paippad", "Thrikkodithanam", "Vakathanam"},
				"Pallom":        []string{"Ayarkunnam", "Kurichy", "Panachikkad", "Puthuppally", "Vijayapuram"},
				"Pampady":       []string{"Akalakunnam", "Kooroppada", "Manarcad", "Meenadam", "Pallikkathodu", "Pampady"},
				"Uzhavoor":      []string{"Kadaplamattom", "Kanakkary", "Kuravilangad", "Marangattupilly", "Ramapuram", "Uzhavoor", "Veliyannoor"},
				"Vaikom":        []string{"Chempu", "Kallara", "Maravanthuruthu", "T.V. Puram", "Thalayazham", "Udayanapuram", "Vechoor"},
				"Vazhoor":       []string{"Chirakkadavu", "Kangazha", "Nedumkunnam", "Vazhoor", "Vellavoor"},

				// --- Idukki ---
				"Adimali":     []string{"Adimaly", "Bisonvalley", "Konnathady", "Pallivasal", "Vellathooval"},
				"Azhutha":     []string{"Elappara", "Kokkayar", "Kumily", "Peermade", "Peruvanthanam", "Upputhara"},
				"Devikulam":   []string{"Devikulam", "Kanthalloor", "Mankulam", "Marayoor", "Munnar", "Vattavada"},
				"Elamdesom":   []string{"Alakode", "Karimannoor", "Kodikkulam", "Kudayathoor", "Udumbannoor", "Vannappuram", "Velliyamattom"},
				"Idukki":      []string{"Arakkulam", "Idukki-Kanjikuzhi", "Kamakshy", "Mariyapuram", "Vathikudy", "Vazhathope"},
				"Kattappana":  []string{"Ayyappancoil", "Chakkupallam", "Erattayar", "Kanchiyar", "Vandanmedu"},
				"Nedumkandam": []string{"Karunapuram", "Nedumkandam", "Pampadumpara", "Rajakkad", "Rajakumari", "Senapathy", "Udumbanchola"},
				"Thodupuzha":  []string{"Edavetty", "Karimkunnam", "Kumaramangalam", "Manakkad", "Muttom", "Purapuzha"},

				// --- Ernakulam ---
				"Alangad":       []string{"Alangad", "Kadungalloor", "Karumalloor", "Kottuvally"},
				"Angamaly":      []string{"Ayyampuzha", "Kalady", "Karukutty", "Malayattoor-Neeleeswaram", "Manjapra", "Mookkannoor", "Thuravoor"},
				"Edappally":     []string{"Cheranalloor", "Kadamakkudy", "Mulavukad", "Varapuzha"},
				"Koovappadi":    []string{"Asamannoor", "Koovappady", "Mudakkuzha", "Okkal", "Rayamangalam", "Vengoor"},
				"Kothamangalam": []string{"Kavalangad", "Keerampara", "Kottapady", "Nellikuzhy", "Pindimana", "Pothanikkad", "Varapetty"},
				"Mulanthuruthy": []string{"Amballoor", "Chottanikkara", "Edakkattuvayal", "Maned", "Mulanthuruthy", "Udayamperoor"},
				"Muvattupuzha":  []string{"Arakuzha", "Avoly", "Ayavana", "Kallorkkad", "Manjalloor", "Marady", "Paipra", "Valakom"},
				"Palluruthy":    []string{"Chellanam", "Kumbalangi"},
				"Pampakuda":     []string{"Elanji", "Palakkuzha", "Pampakuda", "Ramamangalam", "Thirumarady"},
				"Parakkadavu":   []string{"Chengamanad", "Kunnukara", "Nedumbassery", "Parakkadavu", "Puthenvelikkara"},
				"Paravur":       []string{"Chendamangalam", "Chittattukara", "Ezhikkara", "Vadakkekkara"},
				"Vadavucode":    []string{"Aikaranad", "Kizhakkambalam", "Kunnathunad", "Mazhuvannoor", "Poothrikka", "Thiruvaniyoor", "Vadavucode-Puthencruz"},
				"Vazhakulam":    []string{"Choornikkara", "Edathala", "Keezhmad", "Vazhakulam"},
				"Vypeen":        []string{"Edavanakkad", "Elankunnapuzha", "Kuzhuppilly", "Nayarambalam", "Njarakkal", "Pallippuram"},

				// --- Thrissur ---
				"Anthikkad":      []string{"Anthikkad", "Chazhoor", "Manalur", "Thanniyam"},
				"Chalakkudy":     []string{"Athirappilly", "Kadukutty", "Kodassery", "Koratty", "Meloor", "Pariyaram"},
				"Chavakkad":      []string{"Kadappuram", "Orumanayoor", "Punnayoor", "Punnayurkulam", "Vadakkekad"},
				"Cherpu":         []string{"Avinissery", "Cherpu", "Paralam", "Vallachira"},
				"Chowwannur":     []string{"Chowwannur", "Kadavalloor", "Kattakampal", "Porkulam", "Velur"},
				"Irinjalakkuda":  []string{"Aloor", "Karalam", "Kattoor", "Muriyad", "Padiyoor"},
				"Kodakara":       []string{"Alagappanagar", "Kodakara", "Mattathur", "Nenmenikkara", "Puthukkad", "Thrikkur", "Varantappilly"},
				"Kodungallur":    []string{"Edavilangu", "Eriyad", "Methala"},
				"Mala":           []string{"Alur", "Annamanada", "Kuzhur", "Mala", "Poyya"},
				"Mathilakam":     []string{"Edathiruthy", "Kaipamangalam", "Mathilakam", "Perinjanam", "Sreenarayanapuram"},
				"Mullasseri":     []string{"Elavally", "Mullassery", "Pavaratty", "Venkitangu"},
				"Ollukkara":      []string{"Madakkathara", "Nadathara", "Pananchery", "Puthur"},
				"Pazhayannoor":   []string{"Chelakkara", "Desamangalam", "Kondazhy", "Panjal", "Pazhayannoor", "Thiruvilwamala"},
				"Puzhackal":      []string{"Adat", "Avanur", "Kaiparambu", "Kolazhy", "Mulakunnathukavu", "Tholur"},
				"Thalikulam":     []string{"Engandiyur", "Nattika", "Thalikulam", "Vadanappally", "Valappad"},
				"Vadakkancherry": []string{"Erumapetty", "Mundathikode", "Thekkumkara", "Vadakkancherry"},
				"Vellangallur":   []string{"Poomangalam", "Puthenchira", "Vellangallur", "Velookkara"},

				// --- Palakkad ---
				"Alathur":          []string{"Alathur", "Erimayur", "Kavassery", "Kizhakkencherry", "Melarcode", "Tarur", "Vandazhy"},
				"Attappady":        []string{"Agali", "Pudur", "Sholayur"},
				"Chittoor":         []string{"Eruthempathy", "Kozhinjampara", "Nalleppilly", "Pattanchery", "Perumatty", "Vadakarapathy"},
				"Kollangode":       []string{"Koduvayur", "Kollangode", "Muthalamada", "Pallassana", "Puthunagaram", "Vadavannur"},
				"Kuzhalmannam":     []string{"Kannadi", "Kottayi", "Kuzhalmannam", "Mathur", "Peringottukurissi", "Thenkurissi"},
				"Malampuzha":       []string{"Akathethara", "Elappully", "Kodumba", "Malampuzha", "Marutharode", "Mundur", "Polpully", "Puthuppariyaram"},
				"Mannarkkad":       []string{"Alanallur", "Kanjirapuzha", "Kottopadam", "Kumaramputhur", "Tachampara", "Tenkara"},
				"Nenmara":          []string{"Ayiloor", "Elavancherry", "Nelliyampathy", "Nenmara"},
				"Ottappalam":       []string{"Ambalapara", "Ananganadi", "Chalavara", "Lakkidi-Perur", "Pookkottukavu", "Vaniamkulam"},
				"Palakkad":         []string{"Keralassery", "Kongad", "Mannur", "Parali", "Pirayiri"},
				"Pattambi":         []string{"Koppam", "Kulukkallur", "Muthuthala", "Ongallur", "Thiruvegappura", "Vallapuzha", "Vilayur"},
				"Sreekrishnapuram": []string{"Cherpulassery", "Kadampazhipuram", "Karimpuzha", "Sreekrishnapuram", "Vellinezhi"},
				"Thrithala":        []string{"Anakkara", "Chalissery", "Kappur", "Nagalassery", "Parudur", "Pattithara", "Thirumittacode", "Thrithala"},

				// --- Malappuram ---
				"Areekode":       []string{"Areekode", "Cheekode", "Edavanna", "Kavanoor", "Keezhuparamba", "Kuzhimanna", "Pulikkal", "Urangattiri"},
				"Kalikavu":       []string{"Amarambalam", "Chokkad", "Edappatta", "Kalikavu", "Karuvarakundu", "Tuvvur"},
				"Kondotty":       []string{"Cherukavu", "Muthuvallur", "Pallikkal", "Vazhakkad", "Vazhayur"},
				"Kuttippuram":    []string{"Athavanad", "Edayur", "Irimbiliyam", "Kuttippuram", "Marakkara", "Valanchery"},
				"Malappuram":     []string{"Anakkayam", "Kodur", "Koottilangadi", "Morayur", "Othukkungal", "Pookkottur", "Pulpatta"},
				"Mankada":        []string{"Angadippuram", "Kuruva", "Makkaraparamba", "Mankada", "Moorkkanad", "Puzhakkattiri"},
				"Nilambur":       []string{"Chaliyar", "Chungathara", "Edakkara", "Karulai", "Moothedam", "Pothukal", "Vazhikkadavu"},
				"Perinthalmanna": []string{"Aliparamba", "Elamkulam", "Keezhattur", "Melattur", "Pulamanthole", "Thazhekode", "Vettathur"},
				"Perumpadappu":   []string{"Alamkode", "Maranchery", "Nannamukku", "Perumpadappu", "Veliyankode"},
				"Ponnani":        []string{"Edappal", "Kalady", "Tavanur", "Vattamkulam"},
				"Tanur":          []string{"Cheriyamundam", "Niramaruthur", "Ozhur", "Ponmundam", "Tanalur", "Valavannur"},
				"Tiroorangadi":   []string{"Abdu Rahiman Nagar", "Edarikode", "Moonniyur", "Nannambra", "Peruvallur", "Thennala"},
				"Tirur":          []string{"Kalpakanchery", "Thalakkad", "Thirunavaya", "Vettom"},
				"Vengara":        []string{"Kannamangalam", "Oorakam", "Parappur", "Vengara"},
				"Wandoor":        []string{"Mampad", "Pandikkad", "Porur", "Thiruvali", "Thrikkalangode", "Wandoor"},

				// --- Kozhikode ---
				"Balusseri":     []string{"Atholi", "Balusseri", "Koorachundu", "Kottur", "Naduvannur", "Panangad", "Ulliyeri", "Unnikulam"},
				"Chelannur":     []string{"Chelannur", "Kakkodi", "Kakoor", "Nanmanda", "Narikkuni", "Thalakkulathur"},
				"Koduvally":     []string{"Kizhakkoth", "Madavoor", "Omassery", "Puthuppady", "Tamarassery"},
				"Kozhikode":     []string{"Kadalundi", "Olavanna"},
				"Kunnamangalam": []string{"Chathamangalam", "Kunnamangalam", "Kuruvattoor", "Mavoor", "Perumanna", "Peruvayal"},
				"Kunnummel":     []string{"Kavilumpara", "Kayakkodi", "Kunnummal", "Maruthonkara", "Mokeri", "Nadapuram", "Velom"},
				"Meladi":        []string{"Keezhariyur", "Meppayur", "Thikkodi", "Thurayur"},
				"Panthalayani":  []string{"Arikkulam", "Chemancheri", "Chengottukavu", "Moodadi"},
				"Perambra":      []string{"Changaroth", "Cheruvannur", "Kayanna", "Koothali", "Nochad", "Perambra"},
				"Thodannur":     []string{"Ayancheri", "Maniyur", "Thiruvallur", "Villiappally"},
				"Tuneri":        []string{"Chekkiad", "Edacheri", "Purameri", "Tuneri", "Valayam", "Vanimel"},
				"Vadakara":      []string{"Azhiyur", "Chorode", "Eramala", "Onchiyam"},

				// --- Wayanad ---
				"Kalpetta":        []string{"Kottathara", "Meppadi", "Muppainad", "Muttil", "Padinjarethara", "Pozhuthana", "Thariode", "Vengappally", "Vythiri"},
				"Mananthavady":    []string{"Edavaka", "Thavinjal", "Thirunelly", "Thondernad", "Vellamunda"},
				"Panamaram":       []string{"Kaniyambetta", "Mullankolly", "Panamaram", "Poothadi", "Pulpally"},
				"Sulthan Bathery": []string{"Ambalavayal", "Meenangadi", "Nenmeni", "Noolpuzha"},

				// --- Kannur ---
				"Edakkad":      []string{"Chembilode", "Kadambur", "Muzhappilangad", "Peralassery"},
				"Irikkur":      []string{"Alakode", "Eruvessy", "Irikkur", "Malappattam", "Naduvil", "Padiyoor", "Payyavoor", "Ulikkal"},
				"Iritty":       []string{"Aralam", "Ayyankunnu", "Kelakam", "Kottiyoor", "Muzhakkunnu", "Payam", "Thillankeri"},
				"Kalliasseri":  []string{"Cherukunnu", "Ezhome", "Kadannappally-Panapuzha", "Kalliasseri", "Kannapuram", "Kunhimangalam", "Mattool", "Narath", "Pattuvam"},
				"Kannur":       []string{"Azhikode", "Chirakkal", "Valapattanam"},
				"Kuthuparamba": []string{"Chittariparamba", "Kottayam", "Kunnothuparamba", "Mangattidam", "Pattiam", "Thrippangottur"},
				"Panoor":       []string{"Chokli", "Kariyad", "Mokeri", "Panniyannur"},
				"Payyannur":    []string{"Cherupuzha", "Eramam-Kuttur", "Kankol-Alapadamba", "Karivellur-Peralam", "Peringome-Vayakkara", "Ramanthali"},
				"Peravoor":     []string{"Kanichar", "Kolayad", "Peravoor"},
				"Taliparamba":  []string{"Chapparapadavu", "Chengalai", "Kurumathur", "Kuttiattoor", "Mayyil", "Pariyaram"},
				"Thalassery":   []string{"Anjarakkandy", "Dharmadam", "Eranholi", "Kathirur", "New Mahe", "Pinarayi", "Vengad"},

				// --- Kasaragod ---
				"Karadka":      []string{"Bedadka", "Bellur", "Delampady", "Karadka", "Kuttikole", "Muliyar"},
				"Kanhangad":    []string{"Ajanur", "Madikai", "Pallikkara", "Pullur-Periya", "Uduma"},
				"Kasaragod":    []string{"Badiyadka", "Chengala", "Chemnad", "Kumbadaje", "Madhur", "Mogral-Puthur"},
				"Manjeshwaram": []string{"Enmakaje", "Kumbla", "Mangalpady", "Manjeshwaram", "Meenja", "Paivalike", "Puthige", "Vorkady"},
				"Nileshwaram":  []string{"Cheruvathur", "Kayyur-Cheemeni", "Kinanoor-Karindalam", "Padne", "Pilicode", "Thrikaripur", "Valiyaparamba"},
				"Parappa":      []string{"Balal", "East Eleri", "Kallar", "Kodom-Belur", "Panathady", "West Eleri"},
			},
		},
	}
	_, err = collection.InsertOne(ctx, adminData)
	if err != nil {
		log.Println("Failed to seed Kerala Admin Data:", adminData)
	} else {
		log.Println("Kerala Administrative Data seeded to MongoDB")
	}
}
