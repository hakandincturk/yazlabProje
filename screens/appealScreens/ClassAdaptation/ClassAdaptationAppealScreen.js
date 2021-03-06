import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Button, Checkbox, Dialog, Portal } from "react-native-paper";

import DocumentPicker from "react-native-document-picker";

import storage from "@react-native-firebase/storage";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

import { useNavigation, useRoute } from "@react-navigation/core";
import { Icon } from "react-native-elements";

import getPath from "@flyerhq/react-native-android-uri-path";


const ClassAdaptationAppealScreen = () => {
  const [fileX, setFileX] = useState([{ name: null, uri: null }]);
  const [fileY, setFileY] = useState([{ name: null, uri: null }]);
  const [fileZ, setFileZ] = useState([{ name: null, uri: null }]);
  const [fileQ, setFileQ] = useState([{ name: null, uri: null }]);
  const [isUploadedFileX, setIsUploadedFileX] = useState([{ name: null, uri: null }]);
  const [isUploadedFileY, setIsUploadedFileY] = useState([{ name: null, uri: null }]);
  const [isUploadedFileZ, setIsUploadedFileZ] = useState([{ name: null, uri: null }]);
  const [isUploadedFileQ, setIsUploadedFileQ] = useState([{ name: null, uri: null }]);
  const [fileUploadedLoader, setFileUploadedLoader] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [fileXisLoading, setFileXisLoading] = useState(false);
  const [fileYisLoading, setFileYisLoading] = useState(false);
  const [fileZisLoading, setFileZisLoading] = useState(false);
  const [fileQisLoading, setFileQisLoading] = useState(false);

  const [checked, setChecked] = useState(false);
  const [lastAcceptTermsAndConditions, setLastAcceptTermsAndConditions] = useState(false);
  const [percentCounter, setPercentCounter] = useState(0);
  const [userData, setUserData] = useState(null);
  const [appealUUID, setAppealUUID] = useState(useRoute().params?.appealUUID);
  const navigation = useNavigation();

  useEffect(() => {

    firestore().collection("users")
      .doc(auth().currentUser.uid)
      .get()
      .then(querySnapshot => {
        setUserData(querySnapshot.data());
      });
  }, []);

  useEffect(() => {
    firestore().collection("users")
      .doc(auth().currentUser.uid)
      .collection("appeals")
      .doc(appealUUID)
      .get()
      .then(querySnapshot => {
        console.log(querySnapshot.data()?.appealUUID);
        if (querySnapshot.exists) {
          if (querySnapshot.data()?.files.fileX) {
            setPercentCounter(percentCounter + 1);
            setFileX([{ name: querySnapshot.data()?.files?.fileX }]);
            setIsUploadedFileX([{ name: querySnapshot.data()?.files?.fileX }]);
          }
          if (querySnapshot.data()?.files.fileY) {
            setPercentCounter(percentCounter + 1);
            setFileY([{ name: querySnapshot.data()?.files?.fileY }]);
            setIsUploadedFileY([{ name: querySnapshot.data()?.files?.fileY }]);
          }
          if (querySnapshot.data()?.files.fileZ) {
            setPercentCounter(percentCounter + 1);
            setFileZ([{ name: querySnapshot.data()?.files?.fileZ }]);
            setIsUploadedFileZ([{ name: querySnapshot.data()?.files?.fileZ }]);
          }
          if (querySnapshot.data()?.files.fileQ) {
            setPercentCounter(percentCounter + 1);
            setFileQ([{ name: querySnapshot.data()?.files?.fileQ }]);
            setIsUploadedFileQ([{ name: querySnapshot.data()?.files?.fileQ }]);
          }
        }
      });
  }, []);


  const docPicker = async (type) => {
    if (type === "x") setFileY([{}]);
    else if (type === "y") setFileY([{}]);
    else if (type === "z") setFileZ([{}]);
    else if (type === "q") setFileQ([{}]);

    // Pick a single file
    try {
      const res = await DocumentPicker.pick({
        /*by using allFiles type, you will able to pick any type of media from user device,
        There can me more options as well
        DocumentPicker.types.images: All image types
        DocumentPicker.types.plainText: Plain text files
        DocumentPicker.types.audio: All audio types
        DocumentPicker.types.pdf: PDF documents
        DocumentPicker.types.zip: Zip files
        DocumentPicker.types.csv: Csv files
        DocumentPicker.types.doc: doc files
        DocumentPicker.types.docx: docx files
        DocumentPicker.types.ppt: ppt files
        DocumentPicker.types.pptx: pptx files
        DocumentPicker.types.xls: xls files
        DocumentPicker.types.xlsx: xlsx files
        For selecting more more than one options use the
        type: [DocumentPicker.types.csv,DocumentPicker.types.xls]*/
        type: [DocumentPicker.types.allFiles],
      });

      if (type === "x") setFileX([{ name: res[0].name, uri: res[0].uri }]);
      else if (type === "y") setFileY([{ name: res[0].name, uri: res[0].uri }]);
      else if (type === "z") setFileZ([{ name: res[0].name, uri: res[0].uri }]);
      else if (type === "q") setFileQ([{ name: res[0].name, uri: res[0].uri }]);
      else if (type === "f") setFileF([{ name: res[0].name, uri: res[0].uri }]);

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log("error -----", err);
      } else {
        throw err;
      }
    }
  };

  const uploadFile = async (type) => {
    let file;

    if (type === "x") file = fileX[0];
    else if (type === "y") file = fileY[0];
    else if (type === "z") file = fileZ[0];
    else if (type === "q") file = fileQ[0];

    let fileName = file.name;
    const fileUri = getPath(file.uri);
    const extension = fileName.split(".").pop();
    const name = fileName.split(".").slice(0, -1).join(".");

    fileName = userData.studentNumber + "_"
      + auth().currentUser.displayName.replace(" ", "-") + "_"
      + Date.now() + "_"
      + appealUUID + "_"
      + "file" + type.toUpperCase() + "."
      + extension;


    let task;

    if (extension === "pdf") task = storage().ref("pdf/" + appealUUID + "/" + fileName).putFile(fileUri);
    else if (extension === "jpg" || extension === "jpeg" || extension === "png") task = storage().ref("images/" + appealUUID + "/" + fileName).putFile(fileUri);
    else task = storage().ref("documents/" + appealUUID + "/" + fileName).putFile(fileUri);


    try {
      await task;
      if (type === "x") await firestore().collection("users")
        .doc(auth().currentUser.uid)
        .collection("appeals")
        .doc(appealUUID)
        .set({
          percent: (percentCounter + 1) / 4 * 100,
          files: {
            fileX: fileName,
          },
        }, { merge: true }).then(() => {
          setPercentCounter(percentCounter + 1);
          setFileXisLoading(false);
          setFileX([{ name: fileName, uri: null }]);
          setIsUploadedFileX([{ name: fileName }]);
          setFileUploadedLoader(true);
          setTimeout(() => {
            setFileUploadedLoader(false);
          }, 2000);
        });
      else if (type === "y") await firestore().collection("users")
        .doc(auth().currentUser.uid)
        .collection("appeals")
        .doc(appealUUID)
        .set({
          percent: (percentCounter + 1) / 4 * 100,
          files: {
            fileY: fileName,
          },
        }, { merge: true }).then(() => {
          setPercentCounter(percentCounter + 1);
          setFileYisLoading(false);
          setFileY([{ name: fileName, uri: null }]);
          setIsUploadedFileY([{ name: fileName }]);
          setFileUploadedLoader(true);
          setTimeout(() => {
            setFileUploadedLoader(false);
          }, 2000);
        });
      else if (type === "z") await firestore().collection("users")
        .doc(auth().currentUser.uid)
        .collection("appeals")
        .doc(appealUUID)
        .set({
          percent: (percentCounter + 1) / 4 * 100,
          files: {
            fileZ: fileName,
          },
        }, { merge: true }).then(() => {
          setPercentCounter(percentCounter + 1);
          setFileZisLoading(false);
          setFileZ([{ name: fileName, uri: null }]);
          setIsUploadedFileZ([{ name: fileName }]);
          setFileUploadedLoader(true);
          setTimeout(() => {
            setFileUploadedLoader(false);
          }, 2000);
        });
      else if (type === "q") await firestore().collection("users")
        .doc(auth().currentUser.uid)
        .collection("appeals")
        .doc(appealUUID)
        .set({
          percent: ((percentCounter + 1) / 4 * 100),
          files: {
            fileQ: fileName,
          },
        }, { merge: true }).then(() => {
          setPercentCounter(percentCounter + 1);
          setFileQisLoading(false);
          setFileQ([{ name: fileName, uri: null }]);
          setIsUploadedFileQ([{ name: fileName }]);
          setFileUploadedLoader(true);
          setTimeout(() => {
            setFileUploadedLoader(false);
          }, 2000);
        });
    } catch (e) {
      console.log(e.message);
    }
  };

  const deleteFile = async (type, fileName) => {

    const extension = fileName.split(".").pop();
    let fileExtensionPath;
    if (extension === "pdf") fileExtensionPath = "pdf";
    else if (extension === "jpg" || extension === "jpeg" || extension === "png") fileExtensionPath = "images";
    else fileExtensionPath = "documents";

    try {
      console.log(fileExtensionPath + "/" + appealUUID + "/" + fileName);
      await storage().ref(fileExtensionPath + "/" + appealUUID + "/" + fileName).delete()
        .then(() => {
            if (type === "x") {
              firestore().collection("users")
                .doc(auth().currentUser.uid)
                .collection("appeals")
                .doc(appealUUID)
                .set({
                  percent: (percentCounter - 1) / 4 * 100,
                  files: {
                    fileX: null,
                  },
                }, { merge: true }).then(() => {
                setPercentCounter(percentCounter - 1);
                setFileX([{ name: null, uri: null }]);
                setIsUploadedFileX([{ name: null }]);
              });
            } else if (type === "y") {
              firestore().collection("users")
                .doc(auth().currentUser.uid)
                .collection("appeals")
                .doc(appealUUID)
                .set({
                  percent: (percentCounter - 1) / 4 * 100,
                  files: {
                    fileY: null,
                  },
                }, { merge: true }).then(() => {
                setPercentCounter(percentCounter - 1);
                setFileY([{ name: null, uri: null }]);
                setIsUploadedFileY([{ name: null }]);
              });
            } else if (type === "z") {
              firestore().collection("users")
                .doc(auth().currentUser.uid)
                .collection("appeals")
                .doc(appealUUID)
                .set({
                  percent: (percentCounter - 1) / 4 * 100,
                  files: {
                    fileZ: null,
                  },
                }, { merge: true }).then(() => {
                setPercentCounter(percentCounter - 1);
                setFileZ([{ name: null, uri: null }]);
                setIsUploadedFileZ([{ name: null }]);
              });
            } else if (type === "q") {
              firestore().collection("users")
                .doc(auth().currentUser.uid)
                .collection("appeals")
                .doc(appealUUID)
                .set({
                  percent: (percentCounter - 1) / 4 * 100,
                  files: {
                    fileQ: null,
                  },
                }, { merge: true }).then(() => {
                setPercentCounter(percentCounter - 1);
                setFileQ([{ name: null, uri: null }]);
                setIsUploadedFileQ([{ name: null }]);
              });
            }
          },
        );
    } catch (e) {
      console.log(e.message);
    } finally {
      if (type === "x") setFileX([{ name: null, uri: null }]);
      else if (type === "y") setFileY([{ name: null, uri: null }]);
      else if (type === "z") setFileZ([{ name: null, uri: null }]);
      else if (type === "q") setFileQ([{ name: null, uri: null }]);
    }
  };

  const finishAppeal = async () => {
    try {
      await firestore().collection("users")
        .doc(auth().currentUser.uid)
        .collection("appeals")
        .doc(appealUUID)
        .set({
          isStart: 1,
          percent: 100,
        }, { merge: true });

      await firestore().collection("adminAppeals")
        .doc(appealUUID)
        .set({
          isStart: 1,
        }, { merge: true });

    } catch (e) {
      console.log(e.message);
    }
    navigation.navigate("Applications");
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scv}>
        <Text>
          T.C.
          KOCAEL?? ??N??VERS??TES?? MUAF??YET VE ??NT??BAK Y??NERGES??
          BiRiNC?? B??L??M
          Amac??, Kapsam, Dayanak ve Tan??mlar
          MADDE 1- (1) Bu Yo??nergenin amac??; Yu??kseko??g??retim Kurulu taraf??ndan denklig??i kabul edilen bir o??nlisans
          veya lisans program??ndan gelen o??g??rencilerin, Kocaeli U??niversitesinde o??nlisans ve lisans eg??itim-o??g??retimi
          yapan fak??lte, y??ksekokul, meslek yu??ksekokul ve devlet konservatuar??nda ders muafiyet ve intibak usul ve
          esaslar??n?? d??zenlemektir,
          Kapsam
          MADDE 2- (1) Bu Yo??nerge, Kocaeli U??niversitesi muafiyet ve intibak uygulamalar??na ilis??kin usul ve esaslar??
          kapsar.
          Dayanak
          MADDE 3- (1) Bu Y??nerge, 4/11/1981 tarihli ve 2547 say??l?? Y??ksek????retim Kanunu???un 14?????nc?? maddesine
          dayand??r??larak haz??rlan??lm????t??r.
          Tan??mlar
          MADDE 4- (1) Bu Yo??nergede gec??en;
          a) Akademik Birim: Eg??itim-o??g??retim faaliyetinin y??lru??tu??ldu??g??u?? Faku??lte/Yiiksekokul
          Meslek Yu??ksekokul/Devlet Konservatuar??n??,
          b) B??l??m: Eg??itim _ o??g??retim faaliyetinin y??ru??tu??ldu??g??u?? ilgili bo??l??mu?? program??,
          c) Komisyon: I??lgili akademik birimin ya da bo??l??m??n muafiyet ve intibak is??lemlerini
          yu??ru??ten ve ders vermekle.y??k??mlu?? en az u??c?? o??g??retim eleman??ndan olus??an komisyonu,
          ??) Rekto??r: Kocaeli U??niversitesi Rekto??r??nu??,
          d) Senato: Kocaeli U??niversitesi Senatosunu,
          e) U??niversite: Kocaeli U??niversitesini (KOU??),
          ifade eder.

          ??K??NC?? B??L??M

          Muafiyet ve I??ntibak komisyonunun olus??turulm??s??, Bas??vurular ve Bas??vuru S??artlar??, Ders Muaf??yeti
          Deg??erlendirmesi ve Muafiyet Raporu,
          Muafiyet ve I??ntibaklar??n Yap??lmas??
          MADDE 5- (1) Komisyon, akademik birim taraf??ndan ''Akademik Birim Komisyonu'' olarak olus??turulabileceg??i
          gibi, ilgili bo??l??m bas??kan?? taraf??ndan, bo??lu??m bas??kan?? veya bo??l??m bas??kan yard??mc??s??n??n bas??kanl??????nda,
          ders vermekle yu??k??mlu?? en az u??c?? o??g??retim eleman??ndan bo??l??m komisyonu olarak da olus??turulabilir.
          Muafiyet ve intibak bas??vurular??
          MADDE 6- (1) Muafiyet ve intibak bas????urulan, kay??t yapt??r??lan eg??itim-o??g??retim y??l??n??n/ yar??y??l??n??n en gec??
          birinci haftas?? sonuna kadar ilgili bo??lu??m bas??kanl??klanna s??ahsen yap??l??r. posta ile yap??lan ba??vurular
          kabul edilmez. Bas??vuru yapan o??g??renci istenen belgeleri eksiksiz teslim ettig??ine ilis??kin "evrak teslim
          tutanag????n??" imzalar. Evraklar?? teslim alan personel,
          ????renciye evraklar??n?? teslim ald??????na ili??kin bir belge verir. Ba??vuru sonu??lar?? 15 g??n i??erisinde akademik
          birim y??netim kurullar?? taraf??ndan karara ba??lan??r.
          (2) O??SYM taraf??ndan yap??lan ek yerles??tirmelerde ise mevzuata go??re en k??sa su??rede is??lem yap??l??r.
          (3) Bu Yo??nergenin 6 nc?? maddesinin birinci f??rkas??nda belirtilen zamanlar d??s????nda muafiyet ve intibak
          bas??vurusunda bulunulamaz. Muafiyet ve intibak bas??vurusu sadece bir defaya mahsus yap??l??r.
          Ders mu??fiyetine bas??vuru s??artlar??
          MADDE 7- (l) Kocaeli U??niversitesinin herhangi bir birimine kay??t yapt??ran bir o??g??renci, as??ag????daki s??artlan
          sag??lamas?? durumunda, kay??t yapt??rd??g???? b??l??me ders muafiyet dilekc??esi ile bas??vuruda bulunabilir.
          a) O??g??renci, muafiyet dilekc??esinde, muaf olmak istedig??i dersleri belirtmeli,
          b) Dikey gec??is??le geldig??ini veya daha o??nce Y??kseko??g??retim Kurulu taraf??ndan denklig??i kabul edilen bir
          o??nlisans veya lisans program??nda eg??itim go??rdu??g????n??, ders ald??g????n?? ve bas??ar??l?? oldug??unu transkript ile
          belgelemeli,
          c) Muafiyet talebinde bulundug??u dersler ic??in, ders ald??g???? kurum tarafindan onaylanm??s?? ders ic??erig??ini ve
          ders kazan??mlar??n??/o??g??renme c????kt??lar??n?? belgelemelidir.
          Ders muafiyeti deg??erlendirmesi
          MADDE 8- (1) O??g??rencinin ders muafiyeti deg??erlendirilirken, es??deg??er programlardan gelen o??g??renciler
          ic??in; beyan edilen ders(ler)in, yar??y??l go??zetilmeksizin, ilgili bo??liim m??fredat??ndaki benzer ic??erig??e veya
          ders kazan??m??na/o??g??renme c????kt??s??na sahip olma s??art?? aran??r.
          (2) Dig??er programlardan gelen o??g??renciler ic??in; benzer ders kazanrmlar??/o??g??renme c????kt??lar?? ve ders
          ic??erig??i olmakla birlikte, ders(ler)in AKTS/kredi/saat deg??er(ler)inden herhangi birine es??deg??er olma s??art??
          aran??r.
          Muafiyet raporu
          MADDE 9- (1) Komisyon taraf??ndan haz??rlanan muafiyet raporu, komisyon u??yelerinin imzas?? ve komisyon
          bas??kan??n??n onay?? ile ilgili akademik birim yo??netim kuruluna sunulur. Yo??netim kurulunun karar??ndan sonra,
          muaf olunan veya muaf olunmayan derslere ilis??kin detayl?? muafiyet karar??, gerekc??eleri ile birlikte ilgili
          o??g??renciye ve O??grenci I??s??leri Daire Ba??kanl??g????na bildirilir. O??g??renci, verilen listeyi sonraki ders
          sec??imlerindIe kullanmak u??zere saklamak ve dan??s??man??n?? bu konuda bilgilendirmekle y??k??mlu??d??r.
          Muaf??yet ve intibak??n yap??lmas??
          MADDE 10- (1) Muafiyeti yap??lan o??g??rencinin, .ilgili s??artlar?? sag??lamas?? ve talepte bulunmas?? halinde u??st
          yar??y??llara intibak?? yap??labilir. O??g??rencinin muaf??yet ve intibak??n??n yap??labilmesi ic??in as??ag????da
          belirtilen durumlar go??z ??n??ne al??n??r:
          a) O??g??renci o??nlisans/lisans mezunu iken O??SYM s??navlar??na tekrar girerek U??niversiteye kayd??n?? yapt??rmas??
          halinde, mezun oldug??u bo??ltimdeki 4'lu??k sistem ??zerinden notu 2'nin altnda bas??ar??l?? oldug??u derslerden CC
          harf nofu ile muaf say??l??r.
          b) ??g??renim go??rdu??g??u?? bo??l??mden mezun olmadan O??SYM s??nav sonuc??lar?? veya yatay gec??is?? ile kay??t yapt??ran
          o??g??renciler ic??in, 4'lu?? sistem ??zerinden notu 2'nin alt??nda ba??arl?? oldu??u ders deg??erlendirilirken genel
          not ortalamas??na bak??l??r. Genel not ortalamas?? 2'nin alt??nda ise o??g??renci o dersten muaf edilmez; 2 ve
          ??zerinde ise bas??ar??l?? ve CC harf notu ile muaf say??l??r.
          c) O??g??renci bas??ka bir u??niversiteden muaf/yeterlI??/bas??ar??l?? gibi deg??erlendirmeler ile gelmis?? ise;
          1) O??g??encinin bu derslerin notunu belgelendirmesi halinde, o notun ka??s????l??g???? kou?? not sistemine
          do??nu??s??tiiru??liir; belgelendirememesi durumunda ise o dersle??e KO?? not sistemindeki CC harf notu verilir.
          2) Muaf olunan dersler, yar??y??l ic??i ortalamalanna kat??lmaz (bu derslerin bas??ans?? %10 hesaplamalar??nda
          dikkate al??nmaz). Ancak genel not ortalamas??na kat??l??r.
          c??) O??g??rencinin o??nlisans/lisans program??ndan mezun olmas?? veya o??g??renim go??rdu??g??u?? bo??l??m/programdan mezun
          olmadan O??SYM s??nav??na tekar girerek U??niversiteye kayd??n?? yapt??rmas?? halinde, t??m yar??y??llara/y??llara ait
          toplam muaf olunan derslerin her bir 40 AKTS deg??eri ic??in bir u??st s??n??fa intibak?? yap??l??r, Bu s??ekildeki
          intibaklar; o??nlisans programlar?? ic??in en fazla 3. yar??y??la, lisans programlan ic??in ise en fazla 5. yar??y??la
          yap??l??r.
          (2) I??ntibak?? yap??lan bir o??g??renci, intibak ettirildig??i yar??y??ldan o??nceki yany??llara ait muaf olmad??g????
          dersleri almak zorundad??r.
          (3) Yatay/Dikey gec??is??lerle veya Y??ksek????retim Kurumlar??nda O??nlisans ve Lisans D??zeyindeki Programlar
          Aras??nda Gec??is??, C??ift Anadal, Yan Dal ile Kurumlar Aras?? Kredi Transferi Yap??lmas?? Esaslanna I??lis??kin
          Yo??netmelik kapsam??nda nakil yoluyla U??niversiteye gelen o??g??rencilerin, alt yar??y??llardan muaf olmad??klar??
          dersleri almak kos??uluyla, geldikleri yar??y??l/y??la kay??tlar?? yap??l??r. Bu s??ekilde U??niversiteye gelen
          o??g??rencilerden bu Yo??nergenin 10 uncu maddesinin (??) bendinde belirtilen 40 AKTS kos??ulu aranmaz.
          (4) Daha o??nce o??g??renim go??rdu??g??u?? bir ??niversitede yapt??g???? staj?? belgeleyen ve kayd??n?? yapt??rd??g???? birimin
          Staj Komisyonu taraf??ndan staj?? onaylanan o??g??rencinin, staj dersinin kredi kar??s????l??klar?? ile muafiyeti
          yap??l??r,
          (5) O??g??rencinin transkriptinde bas??ar??l?? oldug??u bir ders, birden fazla derse veya birden fazla bas??ar??l??
          oldug??u dersler bir derse es??deg??er say??labilir. Bu durumda; birden fazla dersin bir derse es??deg??er olmas??
          halinde bas??ar??l?? olunan derslerin ag????rl??kl?? not ortalamas?? muaf olunan dersin bas??ar?? notu; bir dersin
          birden fazla derse es??deg??er olmas?? durumunda ise bas??ar??l?? olunan dersin notu, muaf olunan dig??er derslerin
          bas??an notu olarak yaz??l??r.
          ??tiraz
          MADDE 11-(1) Muafiyet karar??n??n ilan??ndan itibaren 3 (u??c??) is?? gtinu?? ic??erisinde o??g??renci muafiyet karar??na
          ilgili bo??l??m/program bas??kanl??g????na dilekc??e ile itirazda bulunabilir. I??tiraz bas??vurusu komisyon taraf??ndan
          10 (on) g??n ic??erisinde sonuc??land??r??larak, ilgili yo??netim kurulu taraf??ndan karara bag??lan??r.
          ??????NC?? B??L??M
          Son Hu??ku??mler
          Hu??ku??m bulunmayan haller
          MADDE 12- (1) Bu Yo??nergede h??k??m bulunmayan hallerde, ilgili mevzuat h??k??mleri ile Senato kararlar??
          uygulan??r.

          Yu??ru??rlu??k
          MADDE 13- (1) Bu Yo??nerge, 2019-2020 eg??itim-o??g??retim y??l??ndan itibaren yu??r??rlu??g??e girer, Bu Yo??nergenin_
          y??r??rlu??g??e girmesi ile 16/11/2016 tarihli ve 2 nolu Senato karar??yla kabul edilen Kocaeli U??niversitesi
          Muafiyet ve I??ntibak Yo??nergesi yu??ru??rl??l??kten kald??r??lm??s??t??r.

          Yu??ru??tme
          MADDE 14- (1) Bu Yo??nerge h??k??mlerini Kocaeli U??niversitesi Rekto??ru?? yu??ru??tu??r.
        </Text>
      </ScrollView>
      <View>
        <View style={styles.acceptTerms}>
          <Checkbox status={checked ? "checked" : "unchecked"}
                    onPress={() => {
                      setChecked(!checked);
                    }}

          />
          <Text>Okudum, anlad??m.</Text>
        </View>
        <View style={styles.content}>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <View key={0}>
              <TouchableOpacity
                style={{
                  marginTop: 6,
                  paddingVertical: 8,
                  paddingLeft: 18,
                  paddingRight: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,.3)",
                  borderRadius: 6,
                }}
                onPress={() => docPicker("x")}
              >
                {fileX[0].name ? fileX.map(({ name, uri }) => {
                  return (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text>{name.length > 25 ? name.substring(0, 22) + "..." : name}</Text>
                      <TouchableOpacity style={{ marginLeft: 18 }}
                                        onPress={() => deleteFile("x", name)}>
                        <Icon name="close" type="ionicon" />
                      </TouchableOpacity>
                      <Button style={{ marginLeft: 4 }} mode="contained" loading={fileXisLoading}
                              onPress={async () => {
                                setFileXisLoading(true);
                                await uploadFile("x");
                              }
                              }><Text
                        style={{ color: "#fff" }}>Y??kle</Text></Button>
                    </View>
                  );
                }) : <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>Transkript</Text>}
              </TouchableOpacity>
            </View>
            <View key={1}>
              <TouchableOpacity
                style={{
                  marginTop: 6,
                  paddingVertical: 8,
                  paddingLeft: 18,
                  paddingRight: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,.3)",
                  borderRadius: 6,
                }}
                onPress={() => docPicker("y")}
              >
                {fileY[0].name ? fileY.map(({ name, uri }) => {
                    return (
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text>{name.length > 25 ? name.substring(0, 22) + "..." : name}</Text>
                        <TouchableOpacity style={{ marginLeft: 18 }}
                                          onPress={() => deleteFile("y", name)}>
                          <Icon name="close" type="ionicon" />
                        </TouchableOpacity>
                        <Button style={{ marginLeft: 4 }} mode="contained" loading={fileYisLoading}
                                onPress={async () => {
                                  setFileYisLoading(true);
                                  await uploadFile("y");
                                }}><Text
                          style={{ color: "#fff" }}>Y??kle</Text></Button>
                      </View>
                    );
                  }) :
                  <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>Ders ????eri??i</Text>}
              </TouchableOpacity>
            </View>
            <View key={2}>
              <TouchableOpacity
                style={{
                  marginTop: 6,
                  paddingVertical: 8,
                  paddingLeft: 18,
                  paddingRight: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,.3)",
                  borderRadius: 6,
                }}
                onPress={() => docPicker("z")}
              >
                {fileZ[0].name ? fileZ.map(({ name, uri }) => {
                  return (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text>{name.length > 25 ? name.substring(0, 22) + "..." : name}</Text>
                      <TouchableOpacity style={{ marginLeft: 18 }}
                                        onPress={() => deleteFile("z", name)}>
                        <Icon name="close" type="ionicon" />
                      </TouchableOpacity>
                      <Button style={{ marginLeft: 4 }} mode="contained" loading={fileZisLoading}
                              onPress={async () => {
                                setFileZisLoading(true);
                                await uploadFile("z");
                              }}><Text
                        style={{ color: "#fff" }}>Y??kle</Text></Button>
                    </View>
                  );
                }) : <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>Ders Plan??</Text>}
              </TouchableOpacity>
            </View>
            <View key={3}>
              <TouchableOpacity
                style={{
                  marginTop: 6,
                  paddingVertical: 8,
                  paddingLeft: 18,
                  paddingRight: 12,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,.3)",
                  borderRadius: 6,
                }}
                onPress={() => docPicker("q")}
              >
                {fileQ[0].name ? fileQ.map(({ name, uri }) => {
                    return (
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text>{name.length > 25 ? name.substring(0, 22) + "..." : name}</Text>
                        <TouchableOpacity style={{ marginLeft: 18 }}
                                          onPress={() => deleteFile("q", name)}>
                          <Icon name="close" type="ionicon" />
                        </TouchableOpacity>
                        <Button style={{ marginLeft: 4 }} mode="contained" loading={fileQisLoading}
                                onPress={async () => {
                                  setFileQisLoading(true);
                                  await uploadFile("q");
                                }}><Text
                          style={{ color: "#fff" }}>Y??kle</Text></Button>
                      </View>
                    );
                  }) :
                  <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>Muafiyet
                    Dilek??esi</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.nextButtonContainer}>
        <Text style={{ color: "#28A745" }}>{fileUploadedLoader ? "Dosya y??klendi." : ""}</Text>
        <Button mode="contained" onPress={() => setIsDialogVisible(true)}
                disabled={!checked || !isUploadedFileX[0].name || !isUploadedFileY[0].name || !isUploadedFileZ[0].name || !isUploadedFileQ[0].name}>
          <Text style={{ color: "#fff" }}>BA??VURUYU TAMAMLA</Text>
        </Button>
      </View>
      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={() => setIsDialogVisible(false)}>
          <Dialog.Title>{"ba??vuruyu tamamla".toLocaleUpperCase()}</Dialog.Title>
          <Dialog.Content>
            <View style={styles.acceptTerms}>
              <Checkbox status={lastAcceptTermsAndConditions ? "checked" : "unchecked"}
                        onPress={() => {
                          setLastAcceptTermsAndConditions(!lastAcceptTermsAndConditions);
                        }}

              />
              <Text>Evraklar?? do??ru doldurdu??umu ve bana ait oldu??unu onayl??yorum.</Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDialogVisible(false)}>Vazge??</Button>
            <Button onPress={() => finishAppeal()}
                    disabled={!lastAcceptTermsAndConditions}>Onayla</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25,
    paddingHorizontal: 24,
  },
  acceptTerms: {
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  scv: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(0,0,0, .2)",
    borderRadius: 4,
    padding: 8,
  },
  nextButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignContent: "space-between",
    justifyContent: "space-between",
    marginVertical: 12,
  },
});


export default ClassAdaptationAppealScreen;
