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


const DoubleMajorAppealScreen = () => {
  const [fileX, setFileX] = useState([{ name: null, uri: null }]);
  const [fileY, setFileY] = useState([{ name: null, uri: null }]);
  const [fileZ, setFileZ] = useState([{ name: null, uri: null }]);
  const [fileQ, setFileQ] = useState([{ name: null, uri: null }]);
  const [fileF, setFileF] = useState([{ name: null, uri: null }]);
  const [isUploadedFileX, setIsUploadedFileX] = useState([{ name: null, uri: null }]);
  const [isUploadedFileY, setIsUploadedFileY] = useState([{ name: null, uri: null }]);
  const [isUploadedFileZ, setIsUploadedFileZ] = useState([{ name: null, uri: null }]);
  const [isUploadedFileQ, setIsUploadedFileQ] = useState([{ name: null, uri: null }]);
  const [isUploadedFileF, setIsUploadedFileF] = useState([{ name: null, uri: null }]);
  const [fileUploadedLoader, setFileUploadedLoader] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [fileXisLoading, setFileXisLoading] = useState(false);
  const [fileYisLoading, setFileYisLoading] = useState(false);
  const [fileZisLoading, setFileZisLoading] = useState(false);
  const [fileQisLoading, setFileQisLoading] = useState(false);
  const [fileFisLoading, setFileFisLoading] = useState(false);

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
          if (querySnapshot.data()?.files.fileF) {
            setPercentCounter(percentCounter + 1);
            setFileF([{ name: querySnapshot.data()?.files?.fileF }]);
            setIsUploadedFileF([{ name: querySnapshot.data()?.files?.fileF }]);
          }
        }
      });
  }, []);


  const docPicker = async (type) => {
    if (type === "x") setFileY([{}]);
    else if (type === "y") setFileY([{}]);
    else if (type === "z") setFileZ([{}]);
    else if (type === "q") setFileQ([{}]);
    else if (type === "f") setFileF([{}]);

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
    else if (type === "f") file = fileF[0];

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
      else if (type === "f") await firestore().collection("users")
        .doc(auth().currentUser.uid)
        .collection("appeals")
        .doc(appealUUID)
        .set({
          files: {
            fileF: fileName,
          },
        }, { merge: true }).then(() => {
          setFileFisLoading(false);
          setFileF([{ name: fileName, uri: null }]);
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
            } else if (type === "f") {
              firestore().collection("users")
                .doc(auth().currentUser.uid)
                .collection("appeals")
                .doc(appealUUID)
                .set({
                  files: {
                    fileF: null,
                  },
                }, { merge: true }).then(() => {
                setFileF([{ name: null, uri: null }]);
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
      else if (type === "f") setFileF([{ name: null, uri: null }]);
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
          KOCAELI?? U??NI??VERSI??TESI?? C??I??FT ANADAL PROGRAMI YO??NETMELI??G??I??
          BI??RI??NCI?? BO??LU??M
          Amac??, Kapsam, Dayanak, Tan??mlar ve K??saltmalar
          MADDE 1 - (1) Bu Yo??netmelig??in amac??, Kocaeli U??niversitesinde c??ift anadal programlar??n??n ac????lmas??na,
          bas??vuru ve kabul kos??ullar??n??n belirlenmesine, yu??ru??tu??lmesine ve bitirilmesine ilis??kin usul ve esaslar??
          du??zenlemektir.
          Kapsam
          MADDE 2 - (1) Bu Yo??netmelik, Kocaeli U??niversitesi c??ift anadal programlar??na ilis??kin hu??ku??mleri kapsar.
          Dayanak
          MADDE 3 - (1) Bu Yo??netmelik;
          a) 2547 say??l?? Yu??kseko??g??retim Kanununun 14 u??ncu?? maddesi,
          b) 24/4/2010 tarihli ve 27561 say??l?? Resmi Gazete'de yay??mlanan Yu??kseko??g??retim Kurumlar??nda O??nlisans ve
          Lisans Du??zeyindeki Programlar Aras??nda Gec??is??, C??ift Anadal, Yan Dal ile Kurumlar Aras?? Kredi Transferi
          Yap??lmas?? Esaslar??na I??lis??kin Yo??netmelik,
          c) 9/6/2017 tarihli ve 30091 say??l?? Resmi Gazete'de yay??mlanan Yu??kseko??g??retim Kurumlar??nda O??nlisans ve
          Lisans Du??zeyindeki Programlar Aras??nda Gec??is??, C??ift Anadal, Yan Dal ile Kurumlar Aras?? Kredi Transferi
          Yap??lmas?? Esaslar??na I??lis??kin Yo??netmelikte Deg??is??iklik Yap??lmas??na Dair Yo??netmelik hu??ku??mlerine
          dayan??larak haz??rlanm??s??t??r.
          Tan??mlar ve k??saltmalar
          MADDE 4 - (1) Bu Yo??netmelikte gec??en;
          a) AKTS: Avrupa Kredi Transfer Sistemini,
          b) Birinci anadal: O??g??rencinin, bas??vuru tarihinde kay??tl?? bulundug??u o??nlisans veya lisans program??n??,
          c) Bo??lu??m/Program: Kocaeli U??niversitesi lisans veya o??nlisans diploma programlar??na o??g??renci kabul eden
          akademik birimlerini, c??) C??AP: C??ift anadal program??n??,
          d) C??AP Dan??s??man??: O??g??rencilerin eg??itim, o??g??retim ve dig??er sorunlar??yla ilgilenmek u??zere
          go??revlendirilen o??g??retim eleman??n??,
          e) GNO: Genel not ortalamas??n??,
          f) I??kinci anadal: O??g??rencinin bas??vurdug??u ve kabul edildig??i ikinci lisans veya o??nlisans diploma
          program??n??,
          g) Kurul: Kocaeli U??niversitesine bag??l?? faku??lte/yu??ksekokul/meslek yu??ksekokullar?? kurullar??n??,
          g??) Rekto??r: Kocaeli U??niversitesi Rekto??ru??nu??,
          h) Senato: Kocaeli Universitesi Senatosunu,
          ??) U??niversite: Kocaeli U??niversitesini.
          i) Yo??netim Kurulu: Kocaeli U??niversitesine bag??l?? faku??lte/yu??sekokul/meslek yu??ksekokullar??n yo??netim
          kurullar??n??,
          ifade eder.
          I??KI??NCI?? BO??LU??M
          C??ift Anadat Program??na I??lis??kin Esaslar
          C??ift anadal program??n??n amac??
          MADDE 5 - (1) C??ift anadal program??n??n amac??, o??g??renimini yu??ksek bas??ar?? seviyesinde su??rdu??ren
          o??g??rencilere, U??niversitede yu??ru??tu??len o??nlisans diploma programlar?? ile dig??er o??nlisans diploma
          programlar?? aras??nda, lisans programlar?? ile dig??er lisans programlar?? veya o??nlisans programlar?? aras??nda
          o??g??renim go??rme imkan?? sag??lamakt??r.
          (2) U??niversite bo??lu??mleri/programlar?? aras??nda C??AP uygulanabilir. Bo??lu??mler/Programlar aras?? C??AP,
          faku??lte/yu??ksekokul/meslek yu??ksekokular??n??n ilgili bo??lu??mlerinin/programlar??n??n C??AP komisyonlar??
          taraf??ndan Yu??ksek O??g??retim Alan Yeterlilikleri dikkate al??narak, haz??rlan??p ilgili kurul karar?? ile Senatoya
          sunulur. Senatoda onaylanan program, U??niversite akademik takviminde belirtilen tarihten itibaren uygulan??r.
          Bas??vuru ve kabul kos??ullar??
          MADDE 6-(1) C??AP kontenjanlar?? akademik y??l bas??lamadan, ilgili bo??lu??mlerin/programlar??n go??ru??s??u?? al??narak,
          faku??lte/yu??ksekokul/meslek yu??ksekokullar?? taraf??ndan yar??y??l??n bas??lang??c??ndan o??nce ilan edilir.
          (2) Bas??vuru an??nda anadal diploma program??ndaki GNO'su 4.00'lu??k not sisteminde en az 3.00 olan ve anadal
          diploma program??n??n ilgili s??n??f??nda bas??ar?? s??ralamas?? itibariyle ilk %20'sinde bulunan o??g??renciler ikinci
          anadal program??na bas??vurabilir. Ayr??ca as??ag????daki s??artlar uyar??nca faku??lte/yu??ksekokul/meslek
          yu??ksekokullar?? kontenjan belirleyebilir ve o??g??renciler bu s??artlar kapsam??nda bas??vuru yapabilir;
          a) C??ift anadal yapacak o??g??rencilerin kontenjan??, anadal diploma program??ndaki GNO'su en az 3.00 olmak
          s??art??yla, anadal diploma program??n??n ilgili s??n??f??nda bas??ar?? s??ralamas?? %20'sinden az olmamak u??zere Senato
          taraf??ndan belirlenir.
          b) Hukuk, T??p ve Sag??l??k Programlar?? ile Mu??hendislik Programlar?? haric?? olmak u??zere, c??ift anadal yap??lacak
          dig??er C??AP kontenjanlar?? da bo??lu??mlerin/programlar??n kontenjan??n??n %20'sinden az olmamak u??zere senato
          taraf??ndan belirlenir.
          c) Anadal diploma program??ndaki GNO'su en az 3.00 olan ancak anadal diploma program??n??n ilgili s??n??f??nda
          bas??ar?? s??ralamas?? itibariyle en u??st %20'sinde yer almayan o??g??rencilerden c??ift anadal yap??lacak
          bo??lu??mu??n/program??n ilgili y??ldaki taban puan??ndan az olmamak u??zere puana sahip olanlar da C??AP'a
          bas??vurabilirler.
          (3) Bas??vuru say??s?? kontenjandan fazla oldug??u takdirde s??ralaman??n nas??l yap??lacag????
          faku??lte/yu??ksekokul/meslek yu??ksekokulunca o??nceden belirlenir ve kontenjan ilan?? ile birlikte o??g??rencilere
          duyurulur.
          (4) O??zel yetenek s??nav?? olan bir bo??lu??mde/programda C??AP yap??lacak ise o??g??rencinin, giris??te o??zel yetenek
          s??nav??n?? bas??armas?? gerekir.
          (5) I??kinci anadal program??na bas??vuran o??g??renciler, bas??vurduklar?? bo??lu??m/program ic??in O??SYM k??lavuzunda
          belirtilen veya ilgili birimler taraf??ndan o??nceden belirlenmis?? o??zel s??artlar?? sag??lamal??d??r.
          (6) Kay??tl?? oldug??u o??nlisans veya lisans bo??lu??mu??nden/program??ndan bas??vurdug??u tarih itibari ile almas??
          gereken tu??m dersleri alan ve bas??aran, ag????rl??kl?? genel not ortalamas?? en az 3.00 olan o??g??renciler ikinci
          anadal diploma program??na;
          a) Anadal lisans diploma program??nda en erken u??c??u??ncu?? yar??y??l??n bas????nda en gec?? ise do??rt y??ll??k
          programlarda bes??inci yar??y??l??n bas????nda, bes?? y??ll??k programlarda yedinci yar??y??l??n bas????nda, alt?? y??ll??k
          programlarda ise dokuzuncu yar??y??l??n bas????nda,
          b) Anadal o??nlisans diploma program??nda en erken ikinci yar??y??l??n bas????nda, en gec?? ise u??c??u??ncu?? yar??y??l??n
          bas????nda bas??vurabilir.
          (7) C??AP ic??in bas??vurular, birinci ve ikinci anadal faku??lte/yu??ksekokul/meslek yu??ksekokullar??na yaz??l??
          olarak yap??l??r. Kabul edilen o??g??renciler, her iki anadala birden ders kay??tlar??n?? yapt??r??rlar. C??AP ic??in
          bas??vuru takvimi Senato taraf??ndan belirlenir.
          (8) En fazla iki programa C??AP bas??vurusu yap??labilir. Birinci o??g??retim program?? o??g??rencileri ikinci
          o??g??retime veya ikinci o??g??retim program?? o??g??rencileri de birinci o??g??retim programlar??na bas??vurabilirler.
          Ancak, birden fazla ikinci anadal diploma program??na kay??t yap??lmaz.
          (9) C??AP???a bas??vurabilmek ic??in o??g??rencinin herhangi bir disiplin cezas?? almam??s?? olmas?? gerekir.(12.05.2019
          30772RG)
          Program??n yu??ru??tu??lmesi/uygulanmas??
          MADDE 7 - (1) C??ift anadal programlar?? ilgili bo??lu??mu??n/program??n o??nerisi ile ilgili kurul taraf??ndan her
          iki programda o??g??rencinin mezuniyetine veya ilis??ig??inin kesilmesine kadar C??AP dan??s??manlar?? taraf??ndan
          izlenir.
          (2) C??AP'a kabul edilen o??g??renciler ic??in her iki program??n C??AP dan??s??manlar?? ilgili programlar??n AKTS'sini,
          program yeterliklerini, derslerin amac??, ic??erik ve o??g??renme kazan??mlar??n?? deg??erlendirerek o??g??rencinin
          c??ift anadal ders plan??n?? haz??rlarlar. Bu ders plan??nda, hem birinci anadal, hem de ikinci anadalda
          o??g??rencinin almas?? gereken tu??m dersler yaz??l??r. Her iki anadal??n C??AP dan??s??manlar?? taraf??ndan onaylanan bu
          ders planlar?? ikinci anadal??n ilgili bo??lu??m/program ve yo??netim kurulunda go??ru??s??u??lerek karara bag??lan??r.
          Yo??netim kurulunca onaylanan ders plan?? ve U??niversitenin C??AP Yo??netmelig??i, daha sonra o??g??renciye imza
          kars????l??g???? teblig?? edilir. Bu ders plan?? haz??rland??ktan sonra o??g??rencinin herhangi bir dersten muafiyet
          isteg??i ya da plan d??s????nda herhangi bir ders alma isteg??i deg??erlendirmeye al??nmaz. Her iki anadaldan birinde
          Senato taraf??ndan onaylanan ders plan?? ve ic??eriklerinde deg??is??iklik olmad??g???? su??rece haz??rlanan c??ift
          anadal ders plan??nda deg??is??iklik yap??lamaz.
          (3) C??AP'a kay??tl?? o??g??rencinin ikinci anadal program??ndan alacag???? derslerin toplam AKTS'si, ilgili program??n
          toplam AKTS'sinin en az o/o35'i olmal??d??r. O??g??rencinin ikinci anadal program??ndan alacag???? herhangi bir ders,
          birinci anadal program??nda muaf tutulamaz veya herhangi bir dersin yerine say??lamaz. O??g??rencinin birinci
          anadal program??ndan ald??g???? herhangi bir ders, o??g??rencinin ders plan??nda belirlenen ikinci anadal
          program??ndan %35 AKTS'lik derslerin d??s????nda say??lmas?? s??art?? ile ikinci anadal program??nda sec??meli
          ders/dersler yerine say??labilir.
          (4) C??AP o??g??rencileri devam ettikleri her iki anadal program??nda da, yu??ru??rlu??kte olan Kocaeli U??niversitesi
          O??nlisans ve Lisans Eg??itim- O??g??retim Yo??netmelig??ine tabidirler. Ancak c??ift anadal program?? o??g??rencileri,
          her bir anadalda ayr?? ayr?? bir o??g??rencinin ders alma limitlerini kullanabilirler.
          (5) C??AP o??g??rencileri, ikinci anadal bo??lu??m/program bas??kan??n onay?? ile derslerinin ve s??navlar??n??n
          c??ak??s??mas?? durumunda ikinci anadal?? yapt??klar?? bo??lu??mu??n/program??n birinci ya da ikinci o??g??retim
          program??ndan ders alabilir ve dig??er o??g??retim s??nav program??nda ilgili dersin s??nav??na girebilir. Buna
          rag??men s??nav programlar??n??n uygun olmamas?? durumunda bu o??g??renciler ic??in ikinci anadal?? yapt??klar?? ilgili
          birimin yo??netim kurulu karar??yla ayr?? bir s??nav takvimi de belirlenebilir.
          (6) Ara s??navlar ic??in herhangi bir nedenle sag??l??k raporu alan bir o??g??renci, her iki anadaldan da raporlu
          say??l??r. Benzer s??ekilde izinli ya da mazeretli olarak yap??lan deg??erlendirmeler her iki anadal?? da kapsar.
          (7) Her iki anadalda I??ngilizce destekli eg??itim yap??lmakta ise ikinci anadalda %30 I??ngilizce ders alma
          kos??ulu aranmaz.
          (8) Tu??rkc??e eg??itim yapan bir anadaldan, I??ngilizce destekli eg??itim yapan ikinci anadala gec??mek isteyen
          o??g??rencilerin I??ngilizce dil yeterliklerini belgelemeleri o??n kos??uldur. Senato taraf??ndan belirlenen
          esaslara go??re dil yeterlig??ini belgeleyen adaylar aras??nda, GNO dikkate al??narak s??ralama yap??l??r. C??AP
          kontenjan?? dolmamas?? halinde, dil yeterlig??ini sag??layamayan adaylara, kendi imkanlar?? ile dil yeterlig??ini
          sag??lamalar?? ic??in bir y??l su??re verilir. Bu su??re ic??erisinde dil yeterlig??ini veremeyen adaylar kesin kay??t
          hakk??n?? kaybederler. I??kinci anadal C??AP dan??s??man?? taraf??ndan ikinci anadalda %30 I??ngilizce ders alma
          kos??ulu sag??lanacak s??ekilde o??g??renciye c??ift anadal ders plan?? haz??rlan??r. Ders plan??nda ikinci anadal??n
          yap??ld??g???? lisans program??na kay??tl?? o??g??rencilerin o??g??renim su??releri boyunca ald??klar?? I??ngilizce dersin
          AKTS es??deg??erinde dersin, C??AP yapan o??g??renci taraf??ndan al??nmas?? sag??lan??r.
          Bas??ar?? deg??erlendirme ve kay??t silme
          MADDE 8 - (1) O??g??rencinin kendi bo??lu??mu??nu??n/program??n??n o??nlisans veya lisans program?? ile c??ift anadal
          program??n??n ayr??l??g????
          esast??r. O??grencinin birinci anadaldan mezuniyeti C??AP nedeni ile etkilenmez. Birinci anadaldan mezun olan
          o??g??renciye birinci anadal o??nlisans/lisans diplomas?? verilir. O??g??rencinin ikinci anadaldan mezuniyet
          diplomas??, ancak devam ettig??i birinci anadal program??ndan mezun olmas?? halinde verilir.
          (2) C??AP o??g??rencilerine, istedikleri takdirde, birinci anadal ve ikinci anadal programlar?? ic??in ayr?? ayr??
          o??g??renim belgesi verilir. Her bir o??g??renim belgesinde sadece o??g??rencinin o anadala ait ald??g???? dersler
          go??sterilir. I??kinci anadaldan al??nacak olan not durum belgesinde, o??g??rencinin C??AP program??na bas??lad??g????
          anadaldaki muaf tutuldug??u dersler de go??sterilir.
          (3) O??g??rencilerin, her yar??y??l (y??ll??k ders plan?? uygulayan bo??lu??mlerde/programlarda y??l) sonunda
          bo??lu??mlerin/programlar??n C??AP dan??s??manlar?? taraf??ndan, birinci anadaldaki yar??y??l (y??ll??k ders plan??
          uygulayan bo??lu??mlerde/programlarda y??l) sonu not ortalamalar?? ilgili

          yo??netim kuruluna sunulur. O??nlisans veya lisans o??g??rencilerinin C??AP'a devam edebilmeleri ve mezun
          olabilmeleri ic??in her yar??y??l (y??ll??k ders plan?? uygulayan bo??lu??mlerde/programlarda y??l) sonu itibar?? ile
          birinci anadala ait GNO'nun en az 2.50 olmas?? s??art?? aran??r. Ancak, tu??m C??AP o??g??renimi su??resince
          o??g??rencinin birinci anadal genel not ortalamas?? bir defaya mahsus olmak u??zere 2.00-2.49 aras??nda olabilir.
          GNO'su 2.00-2.49 aras??nda kalan o??g??rencilere ilgili faku??lte/yu??ksekokul/meslek yu??ksekokul taraf??ndan uyar??
          yaz??s?? yaz??larak programa devam etme hakk?? tan??n??r. Genel not ortalamas?? ikinci kez 2.50'nin alt??na du??s??en
          o??g??rencinin ikinci anadal diploma program??ndan ilgili yo??netim kurulu karar?? ile kayd?? silinir.
          (4) Birinci anadal GNO'su 2.00'??n alt??na du??s??en o??g??rencinin ikinci anadal program??ndan kayd?? ilgili yo??netim
          kurulu karar?? ile silinir. (5) O??g??renciler, c??ift anadal program??ndan kendi isteg??i ile ayr??labilir.
          (6) I??kinci anadal program??ndan iki yar??y??l (y??ll??k ders plan?? uygulayan bo??lu??mlerde/programlarda iki y??l)
          u??st u??ste ders almayan
          o??g??rencinin ikinci anadal diploma program??ndan kayd?? silinir.
          (7) C??AP???a kay??t yapt??ran o??g??rencilerin o??g??renim su??resi ic??erisinde herhangi bir disiplin cezas?? almalar??
          durumunda, disiplin cezas??
          ald??klar?? yar??y??l sonu itibar??yla ikinci anadal program??ndan ilgili yo??netim kurulu karar?? ile kay??tlar??
          silinir. (12.05.2019-30772 RG)
          O??zel o??g??renci
          MADDE 9 - (1) Gec??erli mazereti ilgili kurul ve Senato onay?? ile kabul edilen C??AP o??g??rencisi, en fazla bir
          yar??y??l (y??ll??k ders plan??
          uygulayan bo??lu??mlerde/programlarda bir y??l) bas??ka bir yu??kseko??g??retim kurumunda o??zel o??g??renci olarak
          devam edebilir. Ancak birinci anadal program??ndan mezun olan C??AP o??g??rencisi, bas??ka bir yu??kseko??g??retim
          kurumunda o??zel o??g??renci olarak devam edemez.
          Proje, staj, bitirme c??al??s??mas?? ve is??yeri eg??itimi uygulamalar??
          MADDE 10, (1) C??AP'ta hem birinci hem de ikinci anadala ait proje, staj ve bitirme c??al??s??malar??n??n ayr?? ayr??
          yap??lmas?? zorunlu olup muafiyeti yap??lamaz. I??s??letmede Mu??hendislik/Mesleki Eg??itim (I??ME) uygulamalar??n??n
          es??deg??erlig??i ve ikinci anadalda hangilerinin, hangi ic??erikte ve su??relerde yap??lmas?? gerektig??i,
          o??g??rencinin ikinci anadal yapt??g???? bo??lu??m/program taraf??ndan o??nerilir ve ilgili birimin yo??netim kurulu
          taraf??ndan karara bag??lan??r.
          Mezuniyet
          MADDE 11 - (1) C??AP'taki bas??ar?? ve mezuniyet kos??ullar?? bu Yo??netmelig??in ilgili maddelerine go??re
          belirlenir.
          (2) C??AP o??g??rencileri, sadece birinci anadal program??nda bas??ar?? s??ralamas??na tabi tutulur.
          (3) C??AP su??resi ic??inde birinci anadaldan mezun olan o??g??rencinin o??g??rencilik is??lemleri, ikinci anadala ait
          bo??lu??m/program ve
          faku??lte/yu??ksekokul/meslek yu??ksekokul taraf??ndan yu??ru??tu??lu??r..
          (4) Birinci anadaldan mezuniyet hakk??n?? elde etmek kos??ulu ile c??ift anadal program??n?? tamamlayan o??g??renciye
          ayr??ca ikinci anadal??
          yapt??g???? bo??lu??mu??n./program??n o??nlisans veya lisans diplomas?? verilir.
          Katk?? pay??
          MADDE 12 - (1) C??AP'a tabi o??g??renciler, birinci anadaldan mezun oluncaya kadar sadece birinci anadala ait,
          mezun olduktan sonra ise sadece ikinci anadala ait o??g??renci katk?? pay??n?? yu??ru??rlu??kteki yasal mevzuata uygun
          olarak o??derler.
          U??C??U??NCU?? BO??LU??M C??es??itli ve Son Hu??ku??mler
          Yu??ru??rlu??kten kald??r??lan yo??netmelik
          MADDE 13 - (1) 2016/2016 tarihli ve 29748 say??l?? Resmi Gazete'de yay??mlanan Kocaeli U??niversitesi C??ift Anadal
          Program?? Yo??netmelig??i yu??ru??rlu??kten kald??r??lm??s??t??r.
          Hu??ku??m bulunmayan haller
          MADDE 14-(1) Bu Yo??netmelikte hu??ku??m bulunmayan hallerde; yu??ru??rlu??kte olan Kocaeli U??niversitesi O??nlisans
          ve Lisans Eg??itim- O??g??retim Yo??netmelig??i, Kocaeli U??niversitesi O??nlisans ve Lisans Programlar?? I??c??in O??zel
          O??grenci Yo??nergesi ile Yu??kseko??g??retim Kurumlar??nda O??nlisans ve Lisans Du??zeyindeki Programlar Aras??nda
          Gec??is??, C??ift Anadal, Yan Dal ile Kurumlar Aras?? Kredi Transferi Yap??lmas?? Esaslar??na I??lis??kin Yo??netmelik
          hu??ku??mleri ve Senato kararlar?? uygulan??r.
          Gec??ici Hu??ku??m
          Madde 1 ??? (1) C??AP o??g??rencisinin bu Yo??netmelig??in yu??ru??rlu??g??e girmesinden o??nce alm??s?? oldug??u disiplin
          cezas??ndan dolay?? ikinci anadal program??nda kayd?? silinmez. (12.05.2019-30772 RG)
          Yu??ru??rlu??k
          MADDE 15 - (1) Bu Yo??netmelik, 2019-2020 eg??itim-o??g??retim y??l??nda yu??ru??rlu??g??e girer.
          Yu??ru??tme
          MADDE 16 - (1) Bu Yo??netmelik hu??ku??mlerini Kocaeli U??niversitesi Rekto??ru?? yu??ru??tu??r
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
                }) : <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>Ba??vuru
                  Dilek??esi </Text>}
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
                }) : <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>Transkript</Text>}
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
                }) : <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>Ba??ar??
                  s??ralamas??</Text>}
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
                  <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>??SYM Belgesi</Text>}
              </TouchableOpacity>
            </View>
            <View key={4}>
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
                onPress={() => docPicker("f")}
              >
                {fileF[0].name ? fileF.map(({ name, uri }) => {
                  return (
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text>{name.length > 25 ? name.substring(0, 22) + "..." : name}</Text>
                      <TouchableOpacity style={{ marginLeft: 18 }}
                                        onPress={() => deleteFile("f", name)}>
                        <Icon name="close" type="ionicon" />
                      </TouchableOpacity>
                      <Button style={{ marginLeft: 4 }} mode="contained" loading={fileFisLoading}
                              onPress={async () => {
                                setFileFisLoading(true);
                                await uploadFile("f");
                              }}><Text
                        style={{ color: "#fff" }}>Y??kle</Text></Button>
                    </View>
                  );
                }) : <Text style={{ paddingHorizontal: 64, paddingVertical: 6, textAlign: "center" }}>Yabanc?? Dil
                  Belgesi</Text>}
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


export default DoubleMajorAppealScreen;
